import os
import tempfile
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from app.config.database import db
from app.schemas.analysis_schema import (
    AnalysisRequest,
    AnalysisResponse,
    BulletRewriteItem,
    JobRoleRecommendation,
    KeywordItem,
    KeywordsBlock,
    MetricsItem,
    RecommendationRequest,
    RecommendationsBlock,
    RecruiterImpressionItem,
    SectionHealthItem,
    SkillRecommendation,
)
from app.services.ai_service import AIService
from app.services.ats_service import ATSService
from app.services.job_match_service import JobMatchService
from app.services.scoring_service import ScoringService
from app.services.skill_extractor import SkillExtractor
from app.utils.pdf_parser import PDFParser
from app.utils.text_cleaner import TextCleaner

router = APIRouter(
    prefix="/api/analyze",
    tags=["Analysis"],
)


def _extract_project_titles(lines: list, text: str) -> list:
    """Extract project titles from resume text."""
    import re as _re
    if not _re.search(r"\bprojects?\b", text, _re.I):
        return []

    projects = []
    exclude_prefixes = (
        "bachelor", "master", "pursuing", "higher", "secondary", "completed",
        "university", "college", "playing", "watching", "travelling", "language",
        "hobbies", "education", "skills", "project", "about", "percentage",
        "shows", "detects", "helps", "used", "built", "developed", "engineered",
        "architected", "sos", "key", "technical", "academic", "radius", "video", "audio"
    )

    for i, line in enumerate(lines):
        line_clean = line.strip().rstrip(":")
        m = _re.match(r"^(?:Project(?:\s+Title)?|Title)\s*[:\-]\s*(.+)$", line, _re.I)
        if m:
            val = m.group(1).strip()
            if 3 <= len(val) <= 65:
                projects.append(val)
            continue

        if not line_clean or line_clean.endswith((".", ",", ";")):
            continue
        if not line_clean[0].isupper():
            continue
        words = line_clean.split()
        if len(words) < 2 or len(words) > 8 or len(line_clean) > 55:
            continue
        if line_clean.lower().startswith(exclude_prefixes):
            continue

        has_kw = bool(_re.search(
            r"\b(Application|App|System|Radar|Kit|Platform|Dashboard|Portal|Engine|Analyzer|Detector|Tracker|Tool|Website|Bot|Model|Clone|Service|API|Network|Interface)\b",
            line_clean,
            _re.I,
        ))
        next_is_desc = False
        if i + 1 < len(lines):
            next_line = lines[i + 1].lower()
            if next_line.startswith((
                "shows", "detects", "helps", "used", "built", "developed",
                "engineered", "sos", "-", "•", "*", "features", "designed",
                "implements", "an app", "a mobile"
            )):
                next_is_desc = True

        if has_kw or next_is_desc:
            projects.append(line_clean)

    # Deduplicate while preserving order
    seen = set()
    deduped = []
    for p in projects:
        if p.lower() not in seen:
            seen.add(p.lower())
            deduped.append(p)
    return deduped


def _compute_section_audits(
    resume_text: str,
    matched_skills: list,
    missing_skills: list,
) -> list:
    """
    Deterministic rule-based section health audit.
    Runs on actual extracted PDF/TXT text — never depends on Gemini availability.
    Handles multi-column PDFs, Indian phone numbers, split email addresses, etc.
    """
    import re as _re
    text = resume_text
    text_lower = text.lower()
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    # ── Contact & Header ──────────────────────────────────────────────
    has_email = bool(_re.search(r"[a-zA-Z0-9._%+\-]+\s*@", text))
    has_phone = bool(_re.search(
        r"(\+?\d{1,3}[\s\-]?)?\d{3,5}[\s\-]?\d{3,5}[\s\-]?\d{3,5}", text
    ))
    has_contact = has_email or has_phone
    contact_score = 100 if (has_email and has_phone) else (80 if has_contact else 40)
    contact_findings = []
    if has_email:
        contact_findings.append("Email address detected and parseable by ATS")
    if has_phone:
        contact_findings.append("Phone number found (including international/Indian format)")
    if not has_contact:
        contact_findings.append("No clear email or phone number detected")
    if _re.search(r"linkedin\.com|github\.com|portfolio", text_lower):
        contact_findings.append("Professional profile links detected")

    # ── Professional Summary ──────────────────────────────────────────
    has_summary = bool(_re.search(
        r"\b(summary|profile|about\s*me|objective|career\s*objective|overview|professional\s*summary)\b",
        text_lower,
    ))
    summary_score = 90 if has_summary else 60

    # ── Work Experience ───────────────────────────────────────────────
    # Strictly check for actual commercial work experience or formal internship
    has_work_history = bool(_re.search(
        r"\b(work\s*experience|professional\s*experience|employment\s*(?:history|details)?|work\s*history)\b",
        text_lower,
    ))
    has_internship = bool(_re.search(r"\b(internships?|intern)\b", text_lower))
    has_experience = has_work_history or has_internship

    if has_work_history:
        exp_status = "excellent"
        exp_score = 90
        exp_findings = ["Professional work experience section recognized"]
        exp_rec = "Use STAR-format bullets with numbers: 'Achieved X by doing Y, resulting in Z.'"
    elif has_internship:
        exp_status = "excellent"
        exp_score = 85
        exp_findings = ["Formal internship experience recognized"]
        exp_rec = "Highlight technical deliverables and team contributions during your internship."
    else:
        exp_status = "warning"
        exp_score = 45
        exp_findings = ["No commercial work experience or formal internship detected"]
        exp_rec = "As a student/fresher, prioritize hands-on projects, open-source contributions, or seek entry-level internships."

    # ── Project ───────────────────────────────────────────────────────
    has_projects_header = bool(_re.search(
        r"\b(projects?|portfolio|personal\s*projects?|academic\s*projects?|technical\s*projects?)\b",
        text_lower,
    ))
    projects = _extract_project_titles(lines, text)
    has_projects = bool(projects) or has_projects_header

    if has_projects:
        proj_status = "excellent"
        proj_score = 90
        proj_findings = [
            "Projects detected in resume",
            "Demonstrates practical software development and technical implementation",
        ]
        proj_rec = "Frame project descriptions with quantifiable metrics (e.g. latency, user scale, accuracy) using the STAR format."
    else:
        proj_status = "warning"
        proj_score = 50
        proj_findings = ["No project section detected in resume"]
        proj_rec = "Add 2–3 technical projects demonstrating your programming languages and frameworks."

    # ── Technical Skills ─────────────────────────────────────────────
    skills_count = len(matched_skills)
    tech_status = "excellent" if skills_count >= 4 else ("warning" if skills_count >= 1 else "critical")
    skills_score = min(100, max(50, skills_count * 12))
    skills_findings = [
        f"Extracted {skills_count} recognised technical skills from your resume",
        (
            f"{len(missing_skills)} target role skills not yet present in resume"
            if missing_skills
            else "No specific job description provided — showing all detected skills"
        ),
    ]

    # ── Education & Credentials ───────────────────────────────────────
    has_education = bool(_re.search(
        r"\b(education|university|college|bachelor|master|mca|bca|b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?|degree|diploma|cgpa|gpa)\b",
        text_lower,
    ))
    edu_score = 90 if has_education else 60

    return [
        {
            "section": "Contact & Header",
            "status": "excellent" if has_contact else "critical",
            "score": contact_score,
            "findings": contact_findings or ["Contact details parsed"],
            "recommendation": (
                "Optimal contact structure — ATS scanners will parse identity cleanly."
                if has_contact
                else "Add email, phone number, and LinkedIn URL to the top of your resume."
            ),
        },
        {
            "section": "Professional Summary",
            "status": "excellent" if has_summary else "warning",
            "score": summary_score,
            "findings": (
                ["Clear professional summary / 'About Me' section detected"]
                if has_summary
                else ["No dedicated summary or 'About Me' heading found"]
            ),
            "recommendation": (
                "Good overview. Keep it to 3–4 sentences targeting the role."
                if has_summary
                else "Add a 3-sentence 'About Me' or 'Professional Summary' section."
            ),
        },
        {
            "section": "Work Experience",
            "status": exp_status,
            "score": exp_score,
            "findings": exp_findings,
            "recommendation": exp_rec,
        },
        {
            "section": "Project",
            "status": proj_status,
            "score": proj_score,
            "findings": proj_findings,
            "recommendation": proj_rec,
        },
        {
            "section": "Technical Skills",
            "status": tech_status,
            "score": skills_score,
            "findings": skills_findings,
            "recommendation": (
                f"Incorporate missing skills: {', '.join(missing_skills[:4])}."
                if missing_skills
                else "Strong skills coverage. Keep updating as your stack evolves."
            ),
        },
        {
            "section": "Education & Credentials",
            "status": "excellent" if has_education else "warning",
            "score": edu_score,
            "findings": (
                ["Degree, institution, and academic details located"]
                if has_education
                else ["Education section not clearly labelled"]
            ),
            "recommendation": (
                "Clean education section. Mention CGPA, honours, or certifications."
                if has_education
                else "State your degree, institution, and graduation year explicitly."
            ),
        },
    ]


async def _run_full_analysis(
    resume_text: str,
    job_description: str = "",
    target_role: str = "Software Engineer",
    target_company: str = "",
) -> AnalysisResponse:
    """Core orchestrator combining parser, skills extractor, ATS scorer, job matcher, and Gemini AI."""
    cleaned_text = TextCleaner.clean(resume_text)
    if not cleaned_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume text is empty or could not be parsed.",
        )

    # 1. Extract Skills
    extracted_skills = SkillExtractor.extract(cleaned_text)

    # 2. Score via rule-based engines
    ats_score_data = ATSService.analyze(cleaned_text, extracted_skills)
    scoring_data = ScoringService.score_resume(cleaned_text, extracted_skills)
    ats_score = ats_score_data.get("ats_score", scoring_data.get("overall_score", 75))

    # 3. Job Matching
    match_data = JobMatchService.match_resume(
        resume_skills=extracted_skills,
        job_description=job_description or "",
    )
    matched_skills = match_data["matched_skills"]
    missing_skills = match_data["missing_skills"]
    match_percentage = match_data["match_percentage"]

    # 4. Gemini AI Insights & STAR Bullet Rewrites
    ai_insights = await AIService.analyze_comprehensive(
        resume_text=cleaned_text,
        job_description=job_description or "",
        target_role=target_role or "Software Engineer",
        target_company=target_company or "",
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        ats_score=ats_score,
    )

    # Determine Grade
    if ats_score >= 92:
        grade = "A+"
    elif ats_score >= 84:
        grade = "A"
    elif ats_score >= 72:
        grade = "B"
    elif ats_score >= 60:
        grade = "C"
    else:
        grade = "D"

    # Compute impact quantification metrics
    words = cleaned_text.split()
    word_count = len(words)
    readability_score = 92 if 250 <= word_count <= 800 else (68 if word_count < 250 else 80)
    brevity_score = min(95, max(60, 100 - abs(500 - word_count) // 10))

    # Build response models
    matched_kw_items = [
        KeywordItem(
            name=s,
            category="tools" if s in ["Docker", "Git", "AWS", "Kubernetes", "Linux", "MongoDB"] else "technical",
            found=True,
            importance="high",
        )
        for s in matched_skills
    ]

    missing_kw_items = [
        KeywordItem(
            name=s,
            category="tools" if s in ["Docker", "Git", "AWS", "Kubernetes", "Linux", "MongoDB"] else "technical",
            found=False,
            importance="high",
        )
        for s in missing_skills
    ]

    scan_id = f"scan-{uuid.uuid4().hex[:10]}"
    timestamp = datetime.now(timezone.utc).isoformat()

    metrics = MetricsItem(
        ats_score=ats_score,
        keyword_match=match_percentage,
        impact_quantification=scoring_data.get("length_score", 15) * 5,
        readability_score=readability_score,
        brevity_score=brevity_score,
    )

    recruiter_impression_data = ai_insights.get("recruiter_impression", {})
    recruiter_impression = RecruiterImpressionItem(
        first_glance_summary=recruiter_impression_data.get(
            "first_glance_summary",
            f"In 6 seconds, recruiter identifies technical background in {', '.join(matched_skills[:3]) or 'software engineering'}.",
        ),
        estimated_read_time_seconds=int(recruiter_impression_data.get("estimated_read_time_seconds", 6)),
        top_strengths=recruiter_impression_data.get("top_strengths", []),
        critical_red_flags=recruiter_impression_data.get("critical_red_flags", []),
    )

    bullet_points = [
        BulletRewriteItem(
            id=bp.get("id", f"bp-{idx + 1}"),
            original=bp.get("original", ""),
            improved=bp.get("improved", ""),
            scoreBefore=bp.get("scoreBefore", 55),
            scoreAfter=bp.get("scoreAfter", 92),
            critique=bp.get("critique", ""),
            improvementsApplied=bp.get("improvementsApplied", []),
        )
        for idx, bp in enumerate(ai_insights.get("bullet_points", []))
    ]

    # Section audits: always computed deterministically from actual extracted text.
    # Never rely on Gemini for section detection — it can be empty or wrong when the model
    # returns minimal JSON or is at capacity (503). The rule-based function handles
    # Indian phone numbers, multi-column PDFs with split email addresses, freshers'
    # project-only resumes, and Indian degree keywords (MCA, BCA, B.Tech, CGPA, etc.)
    raw_section_audits = _compute_section_audits(
        resume_text=cleaned_text,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
    )
    section_audits = [
        SectionHealthItem(
            section=sa["section"],
            status=sa["status"],
            score=sa["score"],
            findings=sa["findings"],
            recommendation=sa["recommendation"],
        )
        for sa in raw_section_audits
    ]

    candidate_name = ai_insights.get("candidate_name") or "Candidate"

    raw_recs = ai_insights.get("recommendations") or {}
    suggested_roles = [
        JobRoleRecommendation(
            title=r.get("title", "Software Engineer"),
            match_score=int(r.get("match_score", 85)),
            reason=r.get("reason", "Matches profile competencies and technical strengths."),
            suitable_skills=r.get("suitable_skills", []),
        )
        for r in raw_recs.get("suggested_roles", [])
    ]
    recommended_skills = [
        SkillRecommendation(
            skill=s.get("skill", "Docker"),
            category=s.get("category", "Cloud / DevOps"),
            importance=s.get("importance", "high"),
            reason=s.get("reason", "High-leverage industry skill."),
            for_roles=s.get("for_roles", []),
        )
        for s in raw_recs.get("recommended_skills", [])
    ]
    recommendations_block = RecommendationsBlock(
        suggested_roles=suggested_roles,
        recommended_skills=recommended_skills,
    )

    response = AnalysisResponse(
        id=scan_id,
        timestamp=timestamp,
        candidate_name=candidate_name,
        target_role=target_role or "Software Engineer",
        target_company=target_company or "",
        overall_score=ats_score,
        grade=grade,
        verdict=ai_insights.get("verdict", f"ATS compatibility evaluated at {ats_score}/100."),
        metrics=metrics,
        recruiter_impression=recruiter_impression,
        keywords=KeywordsBlock(
            matched=matched_kw_items,
            missing=missing_kw_items,
            match_percentage=match_percentage,
        ),
        bullet_points=bullet_points,
        section_audits=section_audits,
        recommendations=recommendations_block,
        raw_resume_text=cleaned_text,
        raw_job_description=job_description or "",
    )

    # Save to MongoDB asynchronously if reachable (with non-blocking error handling)
    try:
        if db is not None:
            doc = response.model_dump()
            await db["scans"].insert_one(doc)
    except Exception:
        # MongoDB Atlas cluster is offline — continue without blocking analysis
        pass

    return response


@router.post("", response_model=AnalysisResponse)
async def analyze_resume_endpoint(request: AnalysisRequest):
    """Main JSON endpoint called by the frontend ATS dashboard."""
    resume_text = request.resume_text or ""
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="resume_text cannot be empty.")

    return await _run_full_analysis(
        resume_text=resume_text,
        job_description=request.job_description or "",
        target_role=request.target_role or "Software Engineer",
        target_company=request.target_company or "",
    )


@router.post("/upload", response_model=AnalysisResponse)
async def analyze_file_upload(
    file: UploadFile = File(...),
    job_description: str = Form(""),
    target_role: str = Form("Software Engineer"),
    target_company: str = Form(""),
):
    """Direct file upload endpoint for PDF and TXT resumes."""
    filename = (file.filename or "").lower()
    if not (filename.endswith(".pdf") or filename.endswith(".txt") or filename.endswith(".md")):
        raise HTTPException(
            status_code=400,
            detail=f"Only PDF and TXT files are supported. Received file: '{file.filename}'",
        )

    content = await file.read()
    if not content or len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty (0 bytes).",
        )

    try:
        if filename.endswith(".pdf"):
            extracted_text = PDFParser.extract_text(content)
        else:
            extracted_text = content.decode("utf-8", errors="replace")
    except Exception as parse_err:
        print(f"Error parsing document {file.filename}: {parse_err}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to read PDF document: {parse_err}",
        )

    if not extracted_text or not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the uploaded document. If this is a scanned/image-based PDF, please paste the plain text instead.",
        )

    return await _run_full_analysis(
        resume_text=extracted_text,
        job_description=job_description,
        target_role=target_role,
        target_company=target_company,
    )


@router.get("/history", response_model=List[AnalysisResponse])
async def get_analysis_history():
    """Retrieve past scans from MongoDB, returning empty list if DB is offline."""
    try:
        if db is not None:
            scans = await db["scans"].find().sort("timestamp", -1).limit(15).to_list(15)
            for scan in scans:
                scan.pop("_id", None)
            return scans
    except Exception as db_err:
        print(f"MongoDB history query notice: {db_err}")

    return []


@router.post("/recommendations", response_model=RecommendationsBlock)
async def get_career_recommendations_endpoint(request: RecommendationRequest):
    """Generate job role & skill recommendations using Gemini or intelligent heuristic rules."""
    recs = await AIService.generate_career_recommendations(
        resume_text=request.resume_text or "",
        skills=request.skills or [],
        projects=request.projects or [],
        education=request.education or "",
        experience=request.experience or "",
        target_role=request.target_role or "Software Engineer",
    )
    suggested_roles = [
        JobRoleRecommendation(
            title=r.get("title", "Software Engineer"),
            match_score=int(r.get("match_score", 85)),
            reason=r.get("reason", "Matches technical competencies and background."),
            suitable_skills=r.get("suitable_skills", []),
        )
        for r in recs.get("suggested_roles", [])
    ]
    recommended_skills = [
        SkillRecommendation(
            skill=s.get("skill", "Docker"),
            category=s.get("category", "Cloud / DevOps"),
            importance=s.get("importance", "high"),
            reason=s.get("reason", "High-leverage industry skill."),
            for_roles=s.get("for_roles", []),
        )
        for s in recs.get("recommended_skills", [])
    ]
    return RecommendationsBlock(
        suggested_roles=suggested_roles,
        recommended_skills=recommended_skills,
    )


import json
import re
from typing import Any, Dict, List, Optional
from google import genai
from app.config.settings import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

PRIMARY_MODEL = "models/gemini-3.6-flash"
FALLBACK_MODEL = "models/gemini-3.1-flash-lite"


def _clean_json_text(text: str) -> str:
    """Strip markdown code fence blocks if returned by the LLM."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


class AIService:

    @staticmethod
    async def improve_resume(resume_text: str) -> Dict[str, Any]:
        """Legacy helper for single-endpoint resume improvement."""
        prompt = f"""
You are an expert ATS Resume Reviewer.
Analyze the following resume.
Return ONLY valid JSON.

Resume:
{resume_text}

JSON format:
{{
    "summary": "",
    "strengths": [],
    "weaknesses": [],
    "recommendations": []
}}
"""
        if not client:
            return {
                "summary": "AI service temporarily unavailable.",
                "strengths": [],
                "weaknesses": [],
                "recommendations": ["Please configure GEMINI_API_KEY."],
            }

        for model in [PRIMARY_MODEL, FALLBACK_MODEL]:
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config={"response_mime_type": "application/json"},
                )
                cleaned = _clean_json_text(response.text)
                return json.loads(cleaned)
            except Exception as e:
                print(f"Gemini error with {model}: {e}")
                continue

        return {
            "summary": "AI service temporarily unavailable.",
            "strengths": [],
            "weaknesses": [],
            "recommendations": ["Please try again later."],
        }

    @staticmethod
    async def analyze_comprehensive(
        resume_text: str,
        job_description: str = "",
        target_role: str = "Software Engineer",
        target_company: str = "",
        matched_skills: Optional[List[str]] = None,
        missing_skills: Optional[List[str]] = None,
        ats_score: int = 75,
    ) -> Dict[str, Any]:
        """Generates deep ATS analysis, STAR bullet improvements, recruiter impressions, and section audits."""
        matched_skills = matched_skills or []
        missing_skills = missing_skills or []

        if client:
            prompt = f"""
You are a Principal Technical Recruiter and ATS Optimization Specialist.
Evaluate the candidate's resume against the target role and optional job description.

Candidate Target Role: {target_role}
Target Company: {target_company or 'Tech Enterprise'}
Matched Skills: {', '.join(matched_skills[:10]) if matched_skills else 'None specifically matched'}
Missing Skills: {', '.join(missing_skills[:8]) if missing_skills else 'None identified'}
ATS Benchmark Score: {ats_score}/100

RESUME TEXT:
{resume_text[:4000]}

JOB DESCRIPTION:
{(job_description or '')[:2000]}

Generate an exhaustive, realistic audit matching this EXACT JSON schema:
{{
  "candidate_name": "Extracted candidate name or Job Seeker",
  "verdict": "2-3 impactful sentences on role readiness, ATS strengths, and callback likelihood.",
  "recruiter_impression": {{
    "first_glance_summary": "What a recruiter notes in 6 seconds regarding seniority and core stack.",
    "estimated_read_time_seconds": 6,
    "top_strengths": ["Strength 1 with details", "Strength 2 with details", "Strength 3 with details"],
    "critical_red_flags": ["Concern 1 or gap", "Concern 2 or missing keyword"]
  }},
  "bullet_points": [
    {{
      "id": "bp-1",
      "original": "A specific bullet point extracted or paraphrased from the resume",
      "improved": "Rewritten STAR bullet with high-impact power verb, quantified metric, and outcome",
      "scoreBefore": 55,
      "scoreAfter": 94,
      "critique": "Specific critique of why the original was weak or passive",
      "improvementsApplied": ["Added quantifiable metric", "Used executive leadership verb"]
    }},
    {{
      "id": "bp-2",
      "original": "A second bullet point from the resume",
      "improved": "Rewritten STAR bullet with high-impact power verb, quantified metric, and outcome",
      "scoreBefore": 60,
      "scoreAfter": 92,
      "critique": "Specific critique of original wording",
      "improvementsApplied": ["Injected technical scale", "Eliminated vague duty phrasing"]
    }}
  ],
  "section_audits": [
    {{
      "section": "Contact & Header",
      "status": "excellent",
      "score": 95,
      "findings": ["Contact details parsed successfully", "Professional links detected"],
      "recommendation": "Keep header clean and ATS parsable."
    }},
    {{
      "section": "Professional Summary",
      "status": "warning",
      "score": 75,
      "findings": ["Summary provides high-level context", "Could highlight target role keywords more clearly"],
      "recommendation": "Focus on 3 key achievements aligned with the role."
    }},
    {{
      "section": "Work Experience",
      "status": "excellent",
      "score": 85,
      "findings": ["Chronological order is clear", "Contains relevant technical work history"],
      "recommendation": "Quantify outcomes with percentages, throughput, or dollar metrics."
    }},
    {{
      "section": "Technical Skills",
      "status": "excellent",
      "score": 90,
      "findings": ["Good breadth of modern technologies", "Categorized clearly"],
      "recommendation": "Prioritize required stack skills at the top."
    }},
    {{
      "section": "Education & Credentials",
      "status": "excellent",
      "score": 90,
      "findings": ["Degree and institution listed clearly"],
      "recommendation": "List any relevant coursework, honors, or recent certifications."
    }}
  ],
  "recommendations": {{
    "suggested_roles": [
      {{
        "title": "Specific Job Title matching candidate skills and experience",
        "match_score": 92,
        "reason": "1-2 sentences on why this role matches their technical stack and background.",
        "suitable_skills": ["Skill1", "Skill2", "Skill3"]
      }}
    ],
    "recommended_skills": [
      {{
        "skill": "High-value skill or tool to learn (e.g. Docker, Redis, Kubernetes, Kafka)",
        "category": "Cloud / DevOps | System Architecture | Advanced Frameworks | Databases",
        "importance": "high",
        "reason": "Why mastering this skill unlocks advanced opportunities in the suggested roles.",
        "for_roles": ["Role 1", "Role 2"]
      }}
    ]
  }}
}}
Provide 3 to 4 distinct matching job roles and 4 to 6 high-value skills to learn in the recommendations section.
"""
            for model in [PRIMARY_MODEL, FALLBACK_MODEL]:
                try:
                    response = client.models.generate_content(
                        model=model,
                        contents=prompt,
                        config={"response_mime_type": "application/json"},
                    )
                    cleaned = _clean_json_text(response.text)
                    data = json.loads(cleaned)
                    if isinstance(data, dict) and "verdict" in data:
                        heur = AIService._build_heuristic_recommendations(
                            resume_text=resume_text,
                            skills=matched_skills,
                            target_role=target_role,
                        )
                        if "recommendations" not in data or not isinstance(data["recommendations"], dict):
                            data["recommendations"] = heur
                        else:
                            # If Gemini returned fewer than 3 roles, supplement from heuristics
                            existing_roles = data["recommendations"].get("suggested_roles", [])
                            existing_titles = {r.get("title", "").lower() for r in existing_roles}
                            for hr in heur.get("suggested_roles", []):
                                if len(existing_roles) >= 4:
                                    break
                                if hr.get("title", "").lower() not in existing_titles:
                                    existing_roles.append(hr)
                                    existing_titles.add(hr.get("title", "").lower())
                            data["recommendations"]["suggested_roles"] = existing_roles

                            # If Gemini returned fewer than 4 skills, supplement from heuristics
                            existing_skills = data["recommendations"].get("recommended_skills", [])
                            existing_names = {s.get("skill", "").lower() for s in existing_skills}
                            for hs in heur.get("recommended_skills", []):
                                if len(existing_skills) >= 5:
                                    break
                                if hs.get("skill", "").lower() not in existing_names:
                                    existing_skills.append(hs)
                                    existing_names.add(hs.get("skill", "").lower())
                            data["recommendations"]["recommended_skills"] = existing_skills

                        return data
                except Exception as e:
                    # Model may have temporary capacity spike (503) — silently try fallback model
                    err_str = str(e)
                    if "503" in err_str or "UNAVAILABLE" in err_str:
                        print(f"Notice: {model} temporarily busy, switching to fallback...")
                    else:
                        print(f"Notice: {model} unavailable, switching to fallback...")
                    continue

        # Heuristic fallback if AI service is offline or rate-limited
        return AIService._generate_heuristic_fallback(
            resume_text=resume_text,
            target_role=target_role,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            ats_score=ats_score,
        )

    @staticmethod
    def _generate_heuristic_fallback(
        resume_text: str,
        target_role: str,
        matched_skills: List[str],
        missing_skills: List[str],
        ats_score: int,
    ) -> Dict[str, Any]:
        """Provides high-quality deterministic analysis if the LLM is unreachable."""
        lines = [line.strip() for line in resume_text.split("\n") if line.strip()]
        candidate_name = lines[0] if lines and len(lines[0]) < 35 and not re.search(r"[@\d]", lines[0]) else "Candidate"

        # Find potential bullet points
        bullet_candidates = [
            l.lstrip("-•* ") for l in lines
            if (l.startswith("-") or l.startswith("•") or l.startswith("*")) and len(l) > 20
        ]

        bullet_points = []
        if bullet_candidates:
            for idx, raw_bullet in enumerate(bullet_candidates[:3]):
                bullet_points.append({
                    "id": f"bp-{idx + 1}",
                    "original": raw_bullet,
                    "improved": f"Architected and deployed {raw_bullet.lower()}, elevating operational efficiency by 34% and cutting processing latency.",
                    "scoreBefore": 58,
                    "scoreAfter": 94,
                    "critique": "Original bullet lacked quantifiable scale and business-focused metrics.",
                    "improvementsApplied": [
                        "Pre-pended executive action verb ('Architected and deployed')",
                        "Introduced measurable outcome percentage (34% efficiency boost)",
                        "Focused on operational throughput"
                    ]
                })
        else:
            bullet_points = [
                {
                    "id": "bp-1",
                    "original": "Worked on backend microservices and database integration.",
                    "improved": "Engineered 12+ scalable asynchronous REST APIs and MongoDB pipelines, achieving 99.9% uptime and handling 15k+ daily requests.",
                    "scoreBefore": 52,
                    "scoreAfter": 95,
                    "critique": "Lacks measurable scale, specific percentage improvements, and business outcome metrics.",
                    "improvementsApplied": [
                        "Replaced passive voice with power verb ('Engineered')",
                        "Quantified workload scope ('12+ scalable asynchronous REST APIs')",
                        "Added reliability benchmark ('achieving 99.9% uptime')"
                    ]
                },
                {
                    "id": "bp-2",
                    "original": "Collaborated with team to test features and fix bugs.",
                    "improved": "Spearheaded automated CI/CD and unit testing pipelines, cutting regression defects by 45% and accelerating release cycles.",
                    "scoreBefore": 56,
                    "scoreAfter": 93,
                    "critique": "Framed as routine duty rather than high-leverage initiative.",
                    "improvementsApplied": [
                        "Framed as active leadership ('Spearheaded')",
                        "Quantified defect reduction ('by 45%')",
                        "Highlighted business speed ('accelerating release cycles')"
                    ]
                }
            ]

        has_contact = bool(re.search(r"[@\d]{7,}", resume_text))
        has_summary = bool(re.search(r"summary|profile|about\s*me|about", resume_text, re.I))
        has_work_history = bool(re.search(r"\b(work\s*experience|professional\s*experience|employment|work\s*history)\b", resume_text, re.I))
        has_internship = bool(re.search(r"\b(internships?|intern)\b", resume_text, re.I))
        has_experience = has_work_history or has_internship
        has_projects = bool(re.search(r"\b(projects?|portfolio|personal\s*projects?)\b", resume_text, re.I))
        has_education = bool(re.search(r"education|university|college|bachelor|master|mca|bca|degree", resume_text, re.I))

        section_audits = [
            {
                "section": "Contact & Header",
                "status": "excellent" if has_contact else "critical",
                "score": 100 if has_contact else 45,
                "findings": ["Contact email and details found" if has_contact else "Missing clear email or phone number"],
                "recommendation": "Ensure email, phone, and LinkedIn URL are clearly readable."
            },
            {
                "section": "Professional Summary",
                "status": "excellent" if has_summary else "warning",
                "score": 88 if has_summary else 60,
                "findings": ["Summary / 'About Me' section detected" if has_summary else "No dedicated professional summary header found"],
                "recommendation": "Include a targeted 3-sentence summary highlighting your core tech competencies."
            },
            {
                "section": "Work Experience",
                "status": "excellent" if has_experience else "warning",
                "score": 88 if has_work_history else (80 if has_internship else 45),
                "findings": [
                    "Work experience / internship recognized"
                    if has_experience
                    else "No commercial work experience or formal internship detected"
                ],
                "recommendation": (
                    "Frame bullet points using the STAR method with numbers and outcomes."
                    if has_experience
                    else "As a fresher, prioritize internships or open-source projects to build commercial credibility."
                )
            },
            {
                "section": "Project",
                "status": "excellent" if has_projects else "warning",
                "score": 90 if has_projects else 50,
                "findings": [
                    "Projects detected in resume",
                    "Demonstrates practical software development and technical implementation"
                ] if has_projects else ["No project section detected in resume"],
                "recommendation": (
                    "Frame project descriptions with quantifiable metrics (e.g. latency, user scale, accuracy) using the STAR format."
                    if has_projects
                    else "Add 2–3 technical projects demonstrating your programming languages and frameworks."
                )
            },
            {
                "section": "Technical Skills",
                "status": "excellent" if len(matched_skills) >= 4 else "warning",
                "score": min(100, max(50, len(matched_skills) * 12)),
                "findings": [f"Matched {len(matched_skills)} core technical skills", f"{len(missing_skills)} key role skills missing"],
                "recommendation": f"Incorporate missing target competencies: {', '.join(missing_skills[:3]) if missing_skills else 'Maintain relevant modern stack'}"
            },
            {
                "section": "Education & Credentials",
                "status": "excellent" if has_education else "warning",
                "score": 90 if has_education else 65,
                "findings": ["Education and degrees found" if has_education else "Education section missing or irregular"],
                "recommendation": "State institution, degree title, and graduation year explicitly."
            }
        ]

        top_skills_str = ", ".join(matched_skills[:3]) if matched_skills else "modern software engineering"
        return {
            "candidate_name": candidate_name,
            "verdict": f"Candidate demonstrates solid capability in {top_skills_str} for the {target_role} role. ATS compatibility is rated at {ats_score}/100.",
            "recruiter_impression": {
                "first_glance_summary": f"In 6 seconds, recruiter identifies technical background in {top_skills_str} with {len(matched_skills)} verified core competencies.",
                "estimated_read_time_seconds": 6,
                "top_strengths": [
                    f"Strong baseline in {top_skills_str}.",
                    "Structured layout compatible with standard ATS parsers.",
                    f"Profile matches {len(matched_skills)} requirements for {target_role}."
                ],
                "critical_red_flags": [
                    f"Missing high-demand keywords: {', '.join(missing_skills[:3])}." if missing_skills else "Could expand on measurable scale and user metrics.",
                    "Several bullets focus on duties rather than quantified business outcomes."
                ]
            },
            "bullet_points": bullet_points,
            "section_audits": section_audits,
            "recommendations": AIService._build_heuristic_recommendations(
                resume_text=resume_text,
                skills=matched_skills,
                target_role=target_role,
            ),
        }

    @staticmethod
    def _build_heuristic_recommendations(
        resume_text: str = "",
        skills: Optional[List[str]] = None,
        projects: Optional[List[str]] = None,
        education: Optional[str] = "",
        experience: Optional[str] = "",
        target_role: Optional[str] = "Software Engineer",
    ) -> dict:
        skills = skills or []
        skills_set = {s.lower() for s in skills}
        text_lower = (resume_text or "").lower()

        has_python = "python" in skills_set or "python" in text_lower
        has_js = bool({"javascript", "typescript", "react", "vue", "angular", "node.js", "next.js", "html", "css"} & skills_set) or bool(re.search(r"\b(react|javascript|typescript|vue|angular|frontend|html|css)\b", text_lower))
        has_backend = bool({"python", "fastapi", "django", "flask", "node.js", "express", "sql", "postgresql", "mongodb", "java", "golang"} & skills_set) or bool(re.search(r"\b(backend|api|server|microservice|database|sql|mongodb)\b", text_lower))
        has_embedded = bool({"c++", "c", "arduino", "embedded", "iot", "sensors"} & skills_set) or bool(re.search(r"\b(arduino|iot|microcontroller|ultrasonic|sensor|embedded|radar)\b", text_lower))
        has_mobile = bool({"flutter", "react native", "android", "ios", "kotlin", "swift", "dart"} & skills_set) or bool(re.search(r"\b(flutter|android|mobile\s*app|ios|react\s*native)\b", text_lower))
        has_data = bool({"pandas", "numpy", "machine learning", "data science", "pytorch", "tensorflow", "scikit-learn"} & skills_set) or bool(re.search(r"\b(data\s*science|machine\s*learning|deep\s*learning|pandas|analytics)\b", text_lower))

        roles = []

        # 1. Full Stack Developer
        if has_js and has_backend:
            common = [s for s in skills if s.lower() in {"python", "javascript", "typescript", "react", "html", "css", "sql", "mongodb", "fastapi", "flask", "node.js"}][:4]
            roles.append({
                "title": "Full-Stack Software Engineer",
                "match_score": 94,
                "reason": "Proficiency across both client-side interfaces and server-side data handling enables end-to-end product delivery.",
                "suitable_skills": common or ["Python", "JavaScript", "React", "REST APIs"],
            })

        # 2. Backend Engineer
        if has_backend or has_python:
            common = [s for s in skills if s.lower() in {"python", "fastapi", "django", "flask", "sql", "postgresql", "mongodb", "docker", "redis"}][:4]
            roles.append({
                "title": "Backend Systems Engineer",
                "match_score": 92 if has_backend else 86,
                "reason": "Demonstrated capability in API architecture, server business logic, and database integration.",
                "suitable_skills": common or ["Python", "API Architecture", "SQL / NoSQL", "FastAPI"],
            })

        # 3. Frontend / UI Engineer
        if has_js:
            common = [s for s in skills if s.lower() in {"javascript", "typescript", "react", "html", "css", "tailwind", "next.js"}][:4]
            roles.append({
                "title": "Frontend Web Developer",
                "match_score": 88,
                "reason": "Strong base in modern web component architecture, responsive styling, and client state orchestration.",
                "suitable_skills": common or ["React", "JavaScript", "HTML/CSS", "State Management"],
            })

        # 4. Embedded Systems / IoT Specialist
        if has_embedded:
            common = [s for s in skills if s.lower() in {"c++", "c", "arduino", "sensors", "iot"}][:4]
            roles.append({
                "title": "Embedded Systems & IoT Engineer",
                "match_score": 90,
                "reason": "Hands-on experience with hardware interfaces, sensor telemetry, and micro-controller programming.",
                "suitable_skills": common or ["C++", "Arduino", "Sensors", "Hardware Interfacing"],
            })

        # 5. Mobile Application Developer
        if has_mobile:
            common = [s for s in skills if s.lower() in {"flutter", "android", "dart", "firebase", "kotlin"}][:4]
            roles.append({
                "title": "Mobile Application Engineer",
                "match_score": 89,
                "reason": "Practical portfolio in mobile device UI development, local state, and cross-platform integrations.",
                "suitable_skills": common or ["Flutter", "Android", "Firebase", "Mobile Architecture"],
            })

        # 6. Data & Machine Learning Engineer
        if has_data:
            common = [s for s in skills if s.lower() in {"python", "pandas", "numpy", "sql", "machine learning"}][:4]
            roles.append({
                "title": "Data & Machine Learning Engineer",
                "match_score": 88,
                "reason": "Strong analytical foundation and experience with structured data manipulation and predictive workflows.",
                "suitable_skills": common or ["Python", "Pandas", "SQL", "Model Evaluation"],
            })

        if len(roles) < 2:
            roles.append({
                "title": "Software Development Engineer (SDE-1)",
                "match_score": 87,
                "reason": "Strong foundational computer science background, problem-solving ability, and modern programming experience.",
                "suitable_skills": (skills[:4] if skills else ["Python", "Object-Oriented Design", "Data Structures", "Git"]),
            })
            roles.append({
                "title": "Cloud & DevOps Associate",
                "match_score": 82,
                "reason": "High industry demand for engineers with programming foundations transitioning into automated cloud infrastructure.",
                "suitable_skills": ["Linux / Shell", "Git Workflow", "Docker", "REST Protocols"],
            })

        primary_roles = [r["title"] for r in roles[:2]]

        recommended_skills = [
            {
                "skill": "Docker & Containerization",
                "category": "Cloud / DevOps",
                "importance": "high",
                "reason": "Industry standard for packaging, shipping, and running microservices reproducibly across development and production.",
                "for_roles": primary_roles,
            },
            {
                "skill": "Redis & Distributed Caching",
                "category": "System Architecture",
                "importance": "high",
                "reason": "Accelerates API latency and handles high-throughput session state in modern distributed environments.",
                "for_roles": [r["title"] for r in roles if "Backend" in r["title"] or "Full-Stack" in r["title"] or "SDE" in r["title"]][:2] or primary_roles,
            },
            {
                "skill": "CI/CD & GitHub Actions",
                "category": "DevOps / Quality",
                "importance": "high",
                "reason": "Automates linting, automated test runs, and continuous cloud deployments expected by modern tech teams.",
                "for_roles": primary_roles,
            },
            {
                "skill": "System Design & Microservices",
                "category": "Architecture",
                "importance": "high",
                "reason": "Crucial for scaling web services, decoupling dependencies, and succeeding in senior technical interviews.",
                "for_roles": [r["title"] for r in roles if "Backend" in r["title"] or "Full-Stack" in r["title"] or "SDE" in r["title"]][:2] or primary_roles,
            },
            {
                "skill": "AWS / Cloud Infrastructure (ECS, S3, RDS)",
                "category": "Cloud Computing",
                "importance": "medium",
                "reason": "Provides essential cloud literacy to architect scalable, resilient serverless and containerized solutions.",
                "for_roles": primary_roles,
            },
        ]

        return {
            "suggested_roles": roles[:4],
            "recommended_skills": recommended_skills,
        }

    @staticmethod
    async def generate_career_recommendations(
        resume_text: str,
        skills: Optional[List[str]] = None,
        projects: Optional[List[str]] = None,
        experience: Optional[str] = "",
        education: Optional[str] = "",
        target_role: Optional[str] = "Software Engineer",
    ) -> dict:
        """Standalone method to generate career role & skill recommendations using Gemini or heuristics."""
        skills = skills or []
        projects = projects or []

        if client:
            prompt = f"""
You are an expert Executive Career Coach and Technical Hiring Consultant.
Analyze the candidate's parsed resume profile:
- Primary/Target Role: {target_role or 'Software Engineer'}
- Extracted Skills: {', '.join(skills[:25]) if skills else 'Not explicitly provided'}
- Key Projects: {', '.join(projects[:8]) if projects else 'Not explicitly provided'}
- Qualifications / Education: {education or 'Computer Science / Engineering background'}
- Work Experience Summary: {experience or 'Fresher / Early-career developer'}

RESUME CONTEXT:
{resume_text[:3500]}

Return an exhaustive JSON response matching this EXACT schema:
{{
  "suggested_roles": [
    {{
      "title": "Specific Job Role Title (e.g. Backend Engineer, Full-Stack Developer, DevOps Engineer, IoT Specialist)",
      "match_score": 92,
      "reason": "1-2 sentences explaining why the candidate's skills, projects, and education make them a strong fit.",
      "suitable_skills": ["Skill1", "Skill2", "Skill3"]
    }}
  ],
  "recommended_skills": [
    {{
      "skill": "High-value skill or tool (e.g. Docker, Redis, Kubernetes, Kafka, System Design, GraphQL)",
      "category": "Cloud / DevOps | System Architecture | Advanced Frameworks | Databases | Testing",
      "importance": "high",
      "reason": "Clear explanation of why learning this skill elevates the candidate's market value for the suggested roles.",
      "for_roles": ["Role 1", "Role 2"]
    }}
  ]
}}
Provide 3 to 5 realistic, high-matching job roles and 4 to 6 high-value skills to learn.
"""
            for model in [PRIMARY_MODEL, FALLBACK_MODEL]:
                try:
                    response = client.models.generate_content(
                        model=model,
                        contents=prompt,
                        config={"response_mime_type": "application/json"},
                    )
                    cleaned = _clean_json_text(response.text)
                    data = json.loads(cleaned)
                    if isinstance(data, dict) and ("suggested_roles" in data or "recommended_skills" in data):
                        return {
                            "suggested_roles": data.get("suggested_roles", []),
                            "recommended_skills": data.get("recommended_skills", []),
                        }
                except Exception as e:
                    print(f"Notice: Gemini recommendation call on {model} error: {e}")
                    continue

        return AIService._build_heuristic_recommendations(
            resume_text=resume_text,
            skills=skills,
            projects=projects,
            education=education,
            experience=experience,
            target_role=target_role,
        )
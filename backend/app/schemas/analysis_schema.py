from typing import List, Optional
from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    resume_text: Optional[str] = Field(None, alias="resume")
    job_description: Optional[str] = Field("", alias="job_desc")
    target_role: Optional[str] = Field("Software Engineer", alias="role")
    target_company: Optional[str] = Field("", alias="company")

    class Config:
        populate_by_name = True


class KeywordItem(BaseModel):
    name: str
    category: str = "technical"
    found: bool
    frequency: Optional[int] = 1
    importance: str = "high"


class KeywordsBlock(BaseModel):
    matched: List[KeywordItem] = []
    missing: List[KeywordItem] = []
    match_percentage: float = 0.0


class BulletRewriteItem(BaseModel):
    id: str
    original: str
    improved: str
    scoreBefore: int = 55
    scoreAfter: int = 92
    critique: str
    improvementsApplied: List[str] = []


class SectionHealthItem(BaseModel):
    section: str
    status: str = "excellent"  # "excellent" | "warning" | "critical"
    score: int = 85
    findings: List[str] = []
    recommendation: str


class RecruiterImpressionItem(BaseModel):
    first_glance_summary: str
    estimated_read_time_seconds: int = 6
    top_strengths: List[str] = []
    critical_red_flags: List[str] = []


class MetricsItem(BaseModel):
    ats_score: int
    keyword_match: float
    impact_quantification: int
    readability_score: int
    brevity_score: int


class JobRoleRecommendation(BaseModel):
    title: str
    match_score: int = 85
    reason: str
    suitable_skills: List[str] = []


class SkillRecommendation(BaseModel):
    skill: str
    category: str = "Technical"
    importance: str = "high"  # "high" | "medium"
    reason: str
    for_roles: List[str] = []


class RecommendationsBlock(BaseModel):
    suggested_roles: List[JobRoleRecommendation] = []
    recommended_skills: List[SkillRecommendation] = []


class RecommendationRequest(BaseModel):
    resume_text: Optional[str] = ""
    skills: Optional[List[str]] = []
    projects: Optional[List[str]] = []
    experience: Optional[str] = ""
    education: Optional[str] = ""
    target_role: Optional[str] = "Software Engineer"


class AnalysisResponse(BaseModel):
    id: str
    timestamp: str
    candidate_name: str
    target_role: str
    target_company: Optional[str] = ""
    overall_score: int
    grade: str
    verdict: str
    metrics: MetricsItem
    recruiter_impression: RecruiterImpressionItem
    keywords: KeywordsBlock
    bullet_points: List[BulletRewriteItem]
    section_audits: List[SectionHealthItem]
    recommendations: Optional[RecommendationsBlock] = None
    raw_resume_text: str
    raw_job_description: str

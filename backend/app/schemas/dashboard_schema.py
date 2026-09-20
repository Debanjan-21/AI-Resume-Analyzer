from pydantic import BaseModel


class DashboardResponse(BaseModel):
    total_resumes: int
    completed_analysis: int
    pending_analysis: int
    average_ats_score: float
    top_skills: list[str]
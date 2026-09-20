from pydantic import BaseModel


class JobMatchRequest(BaseModel):
    job_description: str

class JobMatchResponse(BaseModel):
    match_percentage: float
    matched_skills: list[str]
    missing_skills: list[str]
    recommendations: list[str]
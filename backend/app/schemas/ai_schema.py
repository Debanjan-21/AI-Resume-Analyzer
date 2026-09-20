from pydantic import BaseModel


class AIResumeResponse(BaseModel):
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]
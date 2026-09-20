from datetime import datetime

from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: str

    original_filename: str

    stored_filename: str

    file_size: int

    content_type: str

    uploaded_at: datetime

    analysis_status: str

class ResumeDetailResponse(BaseModel):
    id: str

    user_id: str

    original_filename: str

    stored_filename: str

    file_size: int

    content_type: str

    uploaded_at: datetime

    skills: list[str]

    analysis_status: str

    analysis_result: dict | None = None

    ats_result: dict | None = None

    ai_suggestions: dict | None = None
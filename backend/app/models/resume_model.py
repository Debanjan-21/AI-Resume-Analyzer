from datetime import datetime, UTC
from pydantic import BaseModel, Field


class Resume(BaseModel):
    user_id: str

    original_filename: str

    stored_filename: str

    file_path: str

    file_size: int

    content_type: str

    uploaded_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC)
    )

    extracted_text: str = ""

    skills: list[str] = []

    analysis_status: str = "pending"

    analysis_result: dict | None = None

    ats_result: dict | None = None

    ai_suggestions: dict | None = None
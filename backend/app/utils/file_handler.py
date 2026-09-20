import os
import uuid
import shutil
from fastapi import UploadFile

UPLOAD_DIR = "uploads"

ALLOWED_TYPES = [
    "application/pdf"
]

MAX_FILE_SIZE = 5 * 1024 * 1024   # 5 MB


def generate_filename(filename: str) -> str:
    unique_id = uuid.uuid4().hex
    return f"{unique_id}_{filename}"


async def validate_file(file: UploadFile):
    if file.content_type not in ALLOWED_TYPES:
        raise ValueError("Only PDF files are allowed.")

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise ValueError("File size exceeds 5 MB.")

    await file.seek(0)


def save_file(file: UploadFile) -> tuple[str, str]:
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    filename = generate_filename(file.filename)

    filepath = os.path.join(
        UPLOAD_DIR,
        filename
    )

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return filename, filepath
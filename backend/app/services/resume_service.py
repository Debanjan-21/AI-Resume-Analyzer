import os
from fastapi import UploadFile
from datetime import datetime, UTC
from bson import ObjectId
from bson.errors import InvalidId
from app.services.parser_service import ParserService
from app.config.database import resumes_collection
from app.models.resume_model import Resume
from app.config.database import resumes_collection
from app.services.skill_extractor import SkillExtractor
from app.services.scoring_service import ScoringService
from app.services.ats_service import ATSService
from app.services.job_match_service import JobMatchService
from app.services.ai_service import AIService

from app.utils.file_handler import (
    validate_file,
    save_file,
)


class ResumeService:

    @staticmethod
    async def upload_resume(
        file: UploadFile,
        current_user: dict,
    ):
        await validate_file(file)

        filename, filepath = save_file(file)

        text = ParserService.parse_resume(filepath)
        skills = SkillExtractor.extract(text)

        analysis = ScoringService.score_resume(
            text=text,
            skills=skills,
        )

        ats_result = ATSService.analyze(
            text=text,
            skills=skills,
        )

        file_size = os.path.getsize(filepath)

        print(current_user)

        resume = Resume(
            user_id=str(current_user["_id"]),
            original_filename=file.filename,
            stored_filename=filename,
            file_path=filepath,
            file_size=file_size,
            content_type=file.content_type,
            extracted_text=text,
            skills=skills,
            analysis_status="completed",
            analysis_result=analysis,
            ats_result=ats_result,
        )

        result = await resumes_collection.insert_one(
            resume.model_dump()
        )

        return {
            "id": str(result.inserted_id),
            "original_filename": resume.original_filename,
            "stored_filename": resume.stored_filename,
            "file_size": resume.file_size,
            "content_type": resume.content_type,
            "uploaded_at": resume.uploaded_at,
            "analysis_status": resume.analysis_status,
        }

    @staticmethod
    async def get_resume(
        resume_id: str,
        current_user: dict,
    ):
        resume = await resumes_collection.find_one(
            {
                "_id": ObjectId(resume_id),
                "user_id": str(current_user["_id"]),
            }
        )

        if not resume:
            raise ValueError("Resume not found.")

        return {
            "id": str(resume["_id"]),
            "user_id": resume["user_id"],
            "original_filename": resume["original_filename"],
            "stored_filename": resume["stored_filename"],
            "file_size": resume["file_size"],
            "content_type": resume["content_type"],
            "uploaded_at": resume["uploaded_at"],
            "skills": resume["skills"],
            "analysis_status": resume["analysis_status"],
            "analysis_result": resume["analysis_result"],
            "ats_result": resume.get("ats_result"),
        }

    @staticmethod
    async def delete_resume(
        resume_id: str,
        current_user: dict,
    ):
        try:
            object_id = ObjectId(resume_id)
        except InvalidId:
            raise ValueError("Invalid resume ID.")

        resume = await resumes_collection.find_one(
            {
                "_id": object_id,
                "user_id": str(current_user["_id"]),
            }
        )

        if not resume:
            raise ValueError("Resume not found.")

        # Delete PDF from disk
        file_path = os.path.join("uploads", resume["stored_filename"])

        if os.path.exists(file_path):
            os.remove(file_path)

        # Delete MongoDB document
        await resumes_collection.delete_one(
            {
                "_id": object_id
            }
        )

        return {
            "message": "Resume deleted successfully."
        }

    @staticmethod
    async def match_resume(
        resume_id: str,
        job_description: str,
        current_user: dict,
    ):
        resume = await resumes_collection.find_one(
            {
                "_id": ObjectId(resume_id),
                "user_id": str(current_user["_id"]),
            }
        )

        if not resume:
            raise ValueError("Resume not found.")

        result = JobMatchService.match_resume(
            resume["skills"],
            job_description,
        )

        result["recommendations"] = [
            f"Consider adding '{skill}' to your resume."
            for skill in result["missing_skills"][:5]
        ]

        return result

    @staticmethod
    async def improve_resume(
    resume_id: str,
    current_user: dict,
    force_refresh: bool = False,
    ):
        resume = await resumes_collection.find_one(
            {
                "_id": ObjectId(resume_id),
                "user_id": str(current_user["_id"]),
            }
        )

        if not resume:
            raise ValueError("Resume not found.")

        # -----------------------------
        # Return cached AI suggestions
        # -----------------------------
        if (
            not force_refresh
            and resume.get("ai_suggestions")
        ):
            return resume["ai_suggestions"]

        # -----------------------------
        # Generate with Gemini
        # -----------------------------
        suggestions = await AIService.improve_resume(
            resume.get("extracted_text", "")
        )

        # -----------------------------
        # Save to MongoDB
        # -----------------------------
        if suggestions["summary"] != "AI service temporarily unavailable.":
            await resumes_collection.update_one(
                {"_id": resume["_id"]},
                {
                    "$set": {
                        "ai_suggestions": suggestions
                    }
                }
            )

        return suggestions

    @staticmethod
    async def get_user_resumes(user_id: str):

        resumes = await resumes_collection.find(
            {
                "user_id": user_id
            }
        ).to_list(None)

        result = []

        for resume in resumes:
            result.append(
                {
                    "id": str(resume["_id"]),
                    "original_filename": resume["original_filename"],
                    "stored_filename": resume["stored_filename"],
                    "file_size": resume["file_size"],
                    "content_type": resume["content_type"],
                    "uploaded_at": resume["uploaded_at"],
                    "analysis_status": resume["analysis_status"],
                }
            )

        return result

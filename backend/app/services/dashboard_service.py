from collections import Counter

from app.config.database import resumes_collection


class DashboardService:

    @staticmethod
    async def get_dashboard(current_user: dict):

        resumes = await resumes_collection.find(
            {
                "user_id": str(current_user["_id"])
            }
        ).to_list(None)

        total = len(resumes)

        completed = sum(
            1
            for resume in resumes
            if resume["analysis_status"] == "completed"
        )

        pending = total - completed

        ats_scores = [
            resume.get("ats_result", {}).get("ats_score", 0)
            for resume in resumes
            if resume.get("ats_result")
        ]

        average_score = (
            round(sum(ats_scores) / len(ats_scores), 2)
            if ats_scores
            else 0
        )

        counter = Counter()

        for resume in resumes:
            counter.update(resume.get("skills", []))

        top_skills = [
            skill
            for skill, _ in counter.most_common(5)
        ]

        return {
            "total_resumes": total,
            "completed_analysis": completed,
            "pending_analysis": pending,
            "average_ats_score": average_score,
            "top_skills": top_skills,
        }
from app.services.job_match_service import JobMatchService

resume_skills = [
    "Python",
    "FastAPI",
    "SQL",
    "Git",
]

job_description = """
Looking for a Python developer with FastAPI,
Docker, SQL, Git, MongoDB and REST API experience.
"""

result = JobMatchService.match_resume(
    resume_skills,
    job_description,
)

print(result)
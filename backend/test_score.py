from app.services.scoring_service import ScoringService

text = """
John Doe

Email: john@gmail.com

Phone: 9876543210

Python React FastAPI MongoDB Docker Git AWS
"""

skills = [
    "Python",
    "React",
    "FastAPI",
    "MongoDB",
    "Docker",
    "Git",
    "AWS",
]

result = ScoringService.score_resume(
    text,
    skills,
)

print(result)
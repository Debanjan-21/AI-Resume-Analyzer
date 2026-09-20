from app.services.ats_service import ATSService

sample_text = """
John Doe
Email: john@example.com
Phone: +91 9876543210

BCA from XYZ University

Python Java SQL MongoDB FastAPI React Git

Worked as Python Developer.

Project: AI Resume Analyzer
"""

skills = [
    "Python",
    "Java",
    "SQL",
    "MongoDB",
]

print(ATSService.calculate_score(sample_text, skills))
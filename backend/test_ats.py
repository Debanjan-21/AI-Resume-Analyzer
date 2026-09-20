from app.services.ats_service import ATSService

text = """
John Doe

Email: john@gmail.com

Python
React
MongoDB
"""

skills = [
    "Python",
    "React",
    "MongoDB",
]

result = ATSService.analyze(
    text,
    skills,
)

print(result)
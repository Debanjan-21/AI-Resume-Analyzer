from app.services.skill_extractor import SkillExtractor

text = """
Python Developer

React
MongoDB
Docker
FastAPI
Git
AWS
"""

skills = SkillExtractor.extract(text)

print(skills)
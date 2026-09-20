import re
from app.data.skills import SKILLS

ADDITIONAL_KEYWORDS = [
    "CI/CD",
    "GraphQL",
    "Microservices",
    "Kafka",
    "RabbitMQ",
    "Celery",
    "PyTest",
    "Tailwind CSS",
    "LangChain",
    "RAG",
    "AsyncIO",
    "Pydantic",
    "System Design",
    "NLP",
    "Elasticsearch",
    "DevOps",
    "Agile",
    "Scrum",
    "SQL",
    "NoSQL",
    "Cloud",
    "RESTful API",
    "Unit Testing",
    "Integration Testing",
]

TAXONOMY = list(dict.fromkeys(SKILLS + ADDITIONAL_KEYWORDS))


class JobMatchService:

    @staticmethod
    def extract_keywords(job_description: str) -> list[str]:
        if not job_description or not job_description.strip():
            return []

        jd_lower = job_description.lower()
        found_keywords = []

        for skill in TAXONOMY:
            pattern = r"(?<!\w)" + re.escape(skill.lower()) + r"(?!\w)"
            if re.search(pattern, jd_lower):
                found_keywords.append(skill)

        # Fallback if no taxonomy skills found: extract prominent uppercase/tech terms
        if not found_keywords:
            tokens = re.findall(r"\b[A-Za-z0-9+#.]{2,}\b", job_description)
            stop_words = {
                "the", "and", "for", "with", "this", "that", "will", "have", "from",
                "your", "our", "you", "are", "must", "should", "able", "using", "into",
                "than", "their", "they", "about", "years", "year", "experience",
                "work", "team", "role", "help", "good", "well", "required", "skills",
                "candidate", "looking", "responsibilities", "qualifications", "company"
            }
            candidates = [
                w.capitalize() for w in tokens
                if w.lower() not in stop_words and len(w) > 2
            ]
            found_keywords = list(dict.fromkeys(candidates))[:8]

        return found_keywords

    @staticmethod
    def match_resume(
        resume_skills: list[str],
        job_description: str,
    ):
        target_skills = JobMatchService.extract_keywords(job_description)

        resume_skills_map = {s.lower(): s for s in resume_skills}
        resume_lower = set(resume_skills_map.keys())

        if not target_skills:
            # If no target skills extracted from JD, use resume skills as baseline
            matched = list(resume_skills)
            missing = []
            match_percentage = 85.0
        else:
            target_skills_map = {s.lower(): s for s in target_skills}
            target_lower = set(target_skills_map.keys())

            matched_keys = resume_lower & target_lower
            missing_keys = target_lower - resume_lower

            matched = sorted([target_skills_map[k] for k in matched_keys])
            missing = sorted([target_skills_map[k] for k in missing_keys])

            match_percentage = round(
                (len(matched) / len(target_skills)) * 100,
                1,
            )

        return {
            "match_percentage": match_percentage,
            "matched_skills": matched,
            "missing_skills": missing,
        }
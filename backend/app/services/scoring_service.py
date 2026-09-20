import re


class ScoringService:

    @staticmethod
    def score_resume(text: str, skills: list[str]):

        score = 0

        details = {}

        # -------------------------
        # Skills Score (40)
        # -------------------------
        skills_score = min(len(skills) * 4, 40)

        score += skills_score

        details["skills_score"] = skills_score

        # -------------------------
        # Resume Length (20)
        # -------------------------
        words = len(text.split())

        if words >= 500:
            length_score = 20
        elif words >= 300:
            length_score = 15
        elif words >= 150:
            length_score = 10
        else:
            length_score = 5

        score += length_score

        details["length_score"] = length_score

        # -------------------------
        # Email (10)
        # -------------------------
        email_pattern = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"

        email_score = 10 if re.search(email_pattern, text) else 0

        score += email_score

        details["email_score"] = email_score

        # -------------------------
        # Phone (10)
        # -------------------------
        phone_pattern = r"\+?\d[\d\s\-]{8,}\d"

        phone_score = 10 if re.search(phone_pattern, text) else 0

        score += phone_score

        details["phone_score"] = phone_score

        # -------------------------
        # Strength
        # -------------------------
        if score >= 85:
            strength = "Excellent"
        elif score >= 70:
            strength = "Strong"
        elif score >= 50:
            strength = "Average"
        else:
            strength = "Needs Improvement"

        details["overall_score"] = score
        details["resume_strength"] = strength

        return details
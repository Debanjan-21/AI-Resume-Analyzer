import re


class ATSService:

    @staticmethod
    def contact_score(text: str):

        score = 0

        if re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text):
            score += 5

        if re.search(r"\+?\d[\d\s\-]{8,}", text):
            score += 5

        return score

    @staticmethod
    def skills_score(skills):

        return min(len(skills) * 3, 25)

    @staticmethod
    def education_score(text):

        education_keywords = [
            "b.tech",
            "bca",
            "mca",
            "bsc",
            "msc",
            "bachelor",
            "master",
            "university",
            "college",
        ]

        text = text.lower()

        for keyword in education_keywords:
            if keyword in text:
                return 15

        return 0

    @staticmethod
    def experience_score(text):

        keywords = [
            "experience",
            "internship",
            "worked",
            "developer",
            "engineer",
        ]

        text = text.lower()

        count = 0

        for keyword in keywords:
            if keyword in text:
                count += 1

        return min(count * 5, 20)

    @staticmethod
    def project_score(text):

        text = text.lower()

        if "project" in text:
            return 10

        return 0

    @staticmethod
    def length_score(text):

        words = len(text.split())

        if words < 200:
            return 4

        if words < 400:
            return 7

        return 10

    @staticmethod
    def keyword_score(text):

        keywords = [
            "python",
            "java",
            "sql",
            "mongodb",
            "docker",
            "fastapi",
            "react",
            "git",
        ]

        text = text.lower()

        score = 0

        for keyword in keywords:
            if keyword in text:
                score += 2

        return min(score, 10)

    @staticmethod
    def calculate_score(text, skills):

        result = {}

        result["contact_score"] = ATSService.contact_score(text)

        result["skills_score"] = ATSService.skills_score(skills)

        result["education_score"] = ATSService.education_score(text)

        result["experience_score"] = ATSService.experience_score(text)

        result["project_score"] = ATSService.project_score(text)

        result["length_score"] = ATSService.length_score(text)

        result["keyword_score"] = ATSService.keyword_score(text)

        result["overall_score"] = sum(result.values())

        return result

    @staticmethod
    def analyze(text: str, skills: list[str]):

        issues = []
        recommendations = []

        score = 100

        # ----------------------------
        # Email
        # ----------------------------
        email = re.search(
            r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
            text,
        )

        if not email:
            score -= 10
            issues.append("Email not found")
            recommendations.append("Add a professional email address")

        # ----------------------------
        # Phone
        # ----------------------------
        phone = re.search(
            r"\+?\d[\d\s\-]{8,}\d",
            text,
        )

        if not phone:
            score -= 10
            issues.append("Phone number missing")
            recommendations.append("Add your contact number")

        # ----------------------------
        # LinkedIn
        # ----------------------------
        if "linkedin" not in text.lower():
            score -= 10
            issues.append("LinkedIn profile missing")
            recommendations.append("Add your LinkedIn profile URL")

        # ----------------------------
        # GitHub
        # ----------------------------
        if "github" not in text.lower():
            score -= 10
            issues.append("GitHub profile missing")
            recommendations.append("Add your GitHub profile")

        # ----------------------------
        # Projects
        # ----------------------------
        if "project" not in text.lower():
            score -= 15
            issues.append("Projects section missing")
            recommendations.append("Add 2-3 technical projects")

        # ----------------------------
        # Education
        # ----------------------------
        if "education" not in text.lower():
            score -= 10
            issues.append("Education section missing")
            recommendations.append("Include your education details")

        # ----------------------------
        # Experience
        # ----------------------------
        if "experience" not in text.lower():
            score -= 10
            issues.append("Experience section missing")
            recommendations.append("Add internships or work experience")

        # ----------------------------
        # Skills Count
        # ----------------------------
        if len(skills) < 5:
            score -= 10
            issues.append("Too few technical skills")
            recommendations.append("Include more relevant technical skills")

        # ----------------------------
        # Resume Length
        # ----------------------------
        if len(text.split()) < 250:
            score -= 15
            issues.append("Resume is too short")
            recommendations.append("Expand your resume with more details")

        score = max(score, 0)

        return {
            "ats_score": score,
            "issues": issues,
            "recommendations": recommendations,
        }


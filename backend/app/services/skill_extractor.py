import re

from app.data.skills import SKILLS


class SkillExtractor:

    @staticmethod
    def extract(text: str):

        found = []

        text = text.lower()

        for skill in SKILLS:

            pattern = r"(?<!\w)" + re.escape(skill.lower()) + r"(?!\w)"

            if re.search(pattern, text):

                found.append(skill)

        return sorted(found)
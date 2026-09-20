import re


class TextCleaner:

    @staticmethod
    def clean(text: str) -> str:
        # Replace multiple spaces with one space
        text = re.sub(r"[ \t]+", " ", text)

        # Replace multiple blank lines with one blank line
        text = re.sub(r"\n+", "\n", text)

        # Remove leading/trailing spaces
        text = text.strip()

        return text
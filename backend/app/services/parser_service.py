from app.utils.pdf_parser import PDFParser
from app.utils.text_cleaner import TextCleaner


class ParserService:

    @staticmethod
    def parse_resume(filepath: str):

        raw_text = PDFParser.extract_text(filepath)

        cleaned_text = TextCleaner.clean(raw_text)

        return cleaned_text
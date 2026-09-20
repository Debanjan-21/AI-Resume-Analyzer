from app.utils.pdf_parser import PDFParser
from app.utils.text_cleaner import TextCleaner

pdf = "uploads/6fc9be289aaa4b7d8afb7e8d27aae653_resume (2).pdf"

text = PDFParser.extract_text(pdf)

cleaned = TextCleaner.clean(text)

print(cleaned)
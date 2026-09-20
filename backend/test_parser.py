from app.services.parser_service import ParserService

text = ParserService.parse_resume(
    "uploads/6fc9be289aaa4b7d8afb7e8d27aae653_resume (2).pdf"
)

print(text)
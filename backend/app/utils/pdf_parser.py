import pymupdf as fitz
from typing import Union


class PDFParser:

    @staticmethod
    def extract_text(pdf_input: Union[str, bytes]) -> str:
        """Extract text from either a file path string or raw PDF bytes."""
        if isinstance(pdf_input, bytes):
            document = fitz.open(stream=pdf_input, filetype="pdf")
        else:
            document = fitz.open(pdf_input)

        text = ""
        for page in document:
            text += page.get_text()

        document.close()
        return text
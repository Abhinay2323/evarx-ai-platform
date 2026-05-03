"""Text extraction for uploaded documents. Handles pdf, docx, txt/md.

Returns the document as a single string. Chunking happens downstream in
documents.chunker — this module only normalizes the file contents.
"""

from __future__ import annotations

import io


class ExtractionError(Exception):
    """Raised when a document cannot be parsed."""


def extract_text(*, content_type: str, filename: str, body: bytes) -> str:
    ct = (content_type or "").lower()
    name = (filename or "").lower()

    if ct == "application/pdf" or name.endswith(".pdf"):
        return _from_pdf(body)
    if (
        ct
        in (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
        )
        or name.endswith(".docx")
    ):
        return _from_docx(body)
    if ct.startswith("text/") or name.endswith((".txt", ".md", ".markdown")):
        return body.decode("utf-8", errors="replace")

    raise ExtractionError(f"Unsupported content_type={content_type!r} filename={filename!r}")


def _from_pdf(body: bytes) -> str:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(body))
    pages: list[str] = []
    for page in reader.pages:
        try:
            pages.append(page.extract_text() or "")
        except Exception:
            pages.append("")
    return "\n\n".join(pages).strip()


def _from_docx(body: bytes) -> str:
    from docx import Document as DocxDocument

    doc = DocxDocument(io.BytesIO(body))
    return "\n\n".join(p.text for p in doc.paragraphs if p.text).strip()

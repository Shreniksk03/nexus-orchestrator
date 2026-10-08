import io
import logging
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel
import pypdf

logger = logging.getLogger("nexus.api.extract")
router = APIRouter(prefix="/extract", tags=["Document Extraction"])


class TextExtractResponse(BaseModel):
    filename: str
    text: str
    char_count: int
    page_count: int


@router.post("", response_model=TextExtractResponse)
async def extract_document_text(file: UploadFile = File(...)):
    """
    Extracts text from uploaded PDF or plain text files.
    """
    filename = file.filename or "uploaded_contract.txt"
    contents = await file.read()

    extracted_text = ""
    page_count = 1

    if filename.lower().endswith(".pdf") or file.content_type == "application/pdf":
        try:
            reader = pypdf.PdfReader(io.BytesIO(contents))
            page_count = len(reader.pages)
            extracted_pages = []
            for i, page in enumerate(reader.pages):
                txt = page.extract_text() or ""
                extracted_pages.append(txt)
            extracted_text = "\n\n".join(extracted_pages).strip()
        except Exception as e:
            logger.error(f"PDF extraction failed for {filename}: {e}")
            raise HTTPException(status_code=400, detail=f"Failed to extract text from PDF: {str(e)}")
    else:
        # Assume UTF-8 plain text
        try:
            extracted_text = contents.decode("utf-8", errors="replace").strip()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not decode text file: {str(e)}")

    if not extracted_text:
        raise HTTPException(status_code=400, detail="The uploaded document contains no readable text.")

    return TextExtractResponse(
        filename=filename,
        text=extracted_text,
        char_count=len(extracted_text),
        page_count=page_count,
    )

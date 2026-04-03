import os
import shutil
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from models.schemas import DocumentUploadResponse
from utils.project_store import get_project, add_document, get_project_documents
from config import settings

router = APIRouter(prefix="/projects/{project_id}/documents", tags=["documents"])

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}
ALLOWED_DOC_TYPES = {
    "annual_report",
    "quarterly_report",
    "earnings_transcript",
    "industry_report",
    "research_memo",
    "other",
}


def _validate_extension(filename: str) -> str:
    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not supported. Allowed: {ALLOWED_EXTENSIONS}",
        )
    return ext


@router.post("", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(
    project_id: str,
    file: UploadFile = File(...),
    doc_type: str = Form(default="other"),
):
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if doc_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid doc_type. Allowed: {ALLOWED_DOC_TYPES}",
        )

    _validate_extension(file.filename)

    max_bytes = settings.max_file_size_mb * 1024 * 1024
    content = await file.read()
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size: {settings.max_file_size_mb}MB",
        )

    project_upload_dir = os.path.join(settings.upload_dir, project_id)
    os.makedirs(project_upload_dir, exist_ok=True)

    safe_filename = os.path.basename(file.filename)
    file_path = os.path.join(project_upload_dir, safe_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    doc = add_document(
        project_id=project_id,
        file_name=safe_filename,
        doc_type=doc_type,
        file_path=file_path,
    )

    return DocumentUploadResponse(
        document_id=doc["document_id"],
        file_name=safe_filename,
        doc_type=doc_type,
        project_id=project_id,
        message="Document uploaded successfully",
    )


@router.get("")
def list_documents(project_id: str):
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return get_project_documents(project_id)

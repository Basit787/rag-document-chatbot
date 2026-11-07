from uuid import UUID
from fastapi import APIRouter, Depends, File, UploadFile
from .dependencies import get_document_service
from .schema import (
    DocumentResponse,
    UploadDocumentResponse,
)
from .service import DocumentService

document_router = APIRouter()


@document_router.post(
    "/upload",
    response_model=UploadDocumentResponse,
)
def upload_document(
    file: UploadFile = File(...),
    service: DocumentService = Depends(get_document_service),
):
    return service.upload_document(file)


@document_router.get(
    "",
    response_model=list[DocumentResponse],
)
def get_documents(
    service: DocumentService = Depends(get_document_service),
):
    return service.get_documents()


@document_router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    document_id: UUID,
    service: DocumentService = Depends(get_document_service),
):
    return service.get_document(document_id)


@document_router.delete(
    "/{document_id}",
)
def delete_document(
    document_id: UUID,
    service: DocumentService = Depends(get_document_service),
):
    return service.delete_document(document_id)

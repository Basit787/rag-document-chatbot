from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from enum import Enum


class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    s3_key: str
    s3_url: str
    status: str
    summary: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UploadDocumentResponse(BaseModel):
    message: str
    document: DocumentResponse


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]


class DocumentStatus(str, Enum):
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

from fastapi import Depends
from sqlalchemy.orm import Session
from core.database import get_db
from .repository import DocumentRepository
from .service import AIService


def get_document_repository(
    db: Session = Depends(get_db),
):
    return DocumentRepository(db)


def get_ai_service(
    repository: DocumentRepository = Depends(get_document_repository),
):
    return AIService(repository)

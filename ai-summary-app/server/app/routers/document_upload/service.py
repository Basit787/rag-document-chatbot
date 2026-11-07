import logging
import uuid
from uuid import UUID
from fastapi import HTTPException, UploadFile
from .repository import DocumentRepository
from helpers import s3_helper

logger = logging.getLogger(__name__)


class DocumentService:
    def __init__(self, repository: DocumentRepository):
        self.repository = repository

    def upload_document(self, file: UploadFile):
        logger.info("Uploading document: %s", file.filename)
        try:
            if not file.filename:
                logger.warning("Upload failed: No file provided")
                raise HTTPException(
                    status_code=400,
                    detail="File is required.",
                )
            if file.content_type != "text/plain" or not file.filename.lower().endswith(
                ".txt"
            ):
                logger.warning(
                    "Upload failed: Invalid file type '%s' for file '%s'",
                    file.content_type,
                    file.filename,
                )
                raise HTTPException(
                    status_code=400,
                    detail="Only .txt files are allowed.",
                )
            unique_filename = f"{uuid.uuid4()}-{file.filename}"
            s3_url = s3_helper.upload_file(
                file=file.file,
                filename=unique_filename,
            )
            document = self.repository.create_document(
                filename=file.filename,
                s3_key=unique_filename,
                s3_url=s3_url,
            )
            logger.info(
                "Document uploaded successfully. id=%s filename=%s",
                document.id,
                document.filename,
            )

            return {
                "message": "Document uploaded successfully.",
                "document": document,
            }
        except HTTPException:
            raise
        except Exception:
            logger.exception("Failed to upload document: %s", file.filename)
            raise

    def get_documents(self):
        logger.info("Fetching all documents")
        try:
            documents = self.repository.get_documents()
            logger.info("Fetched %d documents", len(documents))
            return documents
        except HTTPException:
            raise
        except Exception:
            logger.exception("Failed to fetch documents")
            raise

    def get_document(self, document_id: UUID):
        logger.info("Fetching document: %s", document_id)
        try:
            document = self.repository.get_document(document_id)
            logger.info("Document fetched successfully: %s", document_id)
            return document
        except HTTPException:
            raise
        except Exception:
            logger.exception("Failed to fetch document: %s", document_id)
            raise

    def delete_document(self, document_id: UUID):
        logger.info("Deleting document: %s", document_id)
        try:
            document = self.repository.get_document(document_id)
            s3_helper.delete_file(document.s3_key)
            self.repository.delete_document(document_id)
            logger.info("Document deleted successfully: %s", document_id)
            return {
                "message": "Document deleted successfully.",
            }
        except HTTPException:
            raise
        except Exception:
            logger.exception("Failed to delete document: %s", document_id)
            raise

    def update_status(
        self,
        document_id: UUID,
        status: str,
    ):
        logger.info(
            "Updating document status. id=%s status=%s",
            document_id,
            status,
        )
        try:
            document = self.repository.update_status(
                document_id,
                status,
            )
            logger.info(
                "Document status updated successfully. id=%s",
                document_id,
            )
            return document
        except HTTPException:
            raise
        except Exception:
            logger.exception(
                "Failed to update document status. id=%s",
                document_id,
            )
            raise

    def update_summary(
        self,
        document_id: UUID,
        summary: str,
    ):
        logger.info(
            "Updating document summary. id=%s",
            document_id,
        )
        try:
            document = self.repository.update_summary(
                document_id,
                summary,
            )
            logger.info(
                "Document summary updated successfully. id=%s",
                document_id,
            )
            return document
        except HTTPException:
            raise
        except Exception:
            logger.exception(
                "Failed to update document summary. id=%s",
                document_id,
            )
            raise

from uuid import UUID
from fastapi import HTTPException, status
from core.base_repo import BaseRepository
from routers.document_upload import Document


class DocumentRepository(BaseRepository):
    model = Document

    def get_document(self, document_id: UUID) -> Document:
        return self.get_by_id(document_id)

    def get_by_s3_key(
        self,
        s3_key: str,
    ) -> Document:
        document = (
            self.session.query(self.model).filter(self.model.s3_key == s3_key).first()
        )

        if document is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found.",
            )

        return document

    def update_status(
        self,
        document_id: UUID,
        status: str,
    ) -> Document:
        return self.update(
            document_id,
            {
                "status": status,
            },
        )

    def update_summary(
        self,
        document_id: UUID,
        summary: str,
    ) -> Document:
        return self.update(
            document_id,
            {
                "summary": summary,
                "status": "COMPLETED",
            },
        )

    def mark_failed(
        self,
        document_id: UUID,
        error: str | None = None,
    ) -> Document:
        data = {
            "status": "FAILED",
        }

        if error and hasattr(self.model, "error_message"):
            data["error_message"] = error

        return self.update(
            document_id,
            data,
        )

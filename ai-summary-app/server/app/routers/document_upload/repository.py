from uuid import UUID
from .model import Document
from core.base_repo import BaseRepository


class DocumentRepository(BaseRepository):
    model = Document

    def __init__(self, session):
        super().__init__(session)

    def create_document(
        self,
        filename: str,
        s3_key: str,
        s3_url: str,
    ) -> Document:
        document = Document(
            filename=filename,
            s3_key=s3_key,
            s3_url=s3_url,
            status="UPLOADED",
        )

        return self.create(document)

    def get_documents(self) -> list[Document]:
        return self.session.query(Document).order_by(Document.created_at.desc()).all()

    def get_document(self, document_id: UUID) -> Document:
        return self.get_by_id(document_id)

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

    def delete_document(
        self,
        document_id: UUID,
    ):
        return self.delete(document_id)

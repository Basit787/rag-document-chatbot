import logging
from .repository import DocumentRepository
from routers.document_upload.schema import DocumentStatus
from helpers import llm_helper, s3_helper

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self, repository: DocumentRepository):
        self.repository = repository

    def process_document(
        self,
        s3_key: str,
    ):
        logger.info(
            "Starting document summarization. s3_key=%s",
            s3_key,
        )

        document = None

        try:
            document = self.repository.get_by_s3_key(s3_key)

            self.repository.update_status(
                document.id,
                DocumentStatus.PROCESSING,
            )

            logger.info(
                "Downloading document from S3. id=%s key=%s",
                document.id,
                document.s3_key,
            )

            text = s3_helper.download_file(
                document.s3_key,
            )

            logger.info(
                "Generating summary. id=%s",
                document.id,
            )

            summary = llm_helper.generate_summary(text)

            self.repository.update_summary(
                document.id,
                summary,
            )

            logger.info(
                "Document summarized successfully. id=%s",
                document.id,
            )

        except Exception:
            logger.exception(
                "Document summarization failed. s3_key=%s",
                s3_key,
            )

            if document:
                try:
                    self.repository.update_status(
                        document.id,
                        DocumentStatus.FAILED,
                    )
                except Exception:
                    logger.exception(
                        "Failed to update document status to FAILED. id=%s",
                        document.id,
                    )

            raise

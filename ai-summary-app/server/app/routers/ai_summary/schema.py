from uuid import UUID
from pydantic import BaseModel


class SummaryRequest(BaseModel):
    document_id: UUID
    s3_key: str

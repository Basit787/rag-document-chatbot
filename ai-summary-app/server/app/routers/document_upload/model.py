from uuid import uuid4
from sqlalchemy import Column, String, Text, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from core.database import Base
from .schema import DocumentStatus


class Document(Base):
    __tablename__ = "documents"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        nullable=False,
    )

    filename = Column(
        String(255),
        nullable=False,
    )

    s3_key = Column(
        String(500),
        nullable=False,
        unique=True,
    )

    s3_url = Column(
        Text,
        nullable=False,
    )

    status = Column(
        Enum(DocumentStatus),
        nullable=False,
        default="UPLOADED",
    )

    summary = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

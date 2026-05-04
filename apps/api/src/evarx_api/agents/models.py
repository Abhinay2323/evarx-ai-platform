import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from evarx_api.core.db import Base


class Agent(Base):
    """A named retrieval-scoped chat persona. The system prompt addendum is
    appended to the base RAG system prompt; the document set determines which
    chunks are eligible for retrieval."""

    __tablename__ = "agents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    system_prompt_addendum: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Which model alias this agent prefers when invoked. The user can override
    # per-message in the chat picker.
    preferred_model: Mapped[str] = mapped_column(
        String(60), nullable=False, default="evarx-medical"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    documents: Mapped[list["AgentDocument"]] = relationship(
        back_populates="agent", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("ix_agents_org", "org_id"),)


class AgentDocument(Base):
    """Many-to-many between agents and documents (composite PK)."""

    __tablename__ = "agent_documents"

    agent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),
        primary_key=True,
    )
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        primary_key=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    agent: Mapped[Agent] = relationship(back_populates="documents")

    __table_args__ = (Index("ix_agent_docs_doc", "document_id"),)

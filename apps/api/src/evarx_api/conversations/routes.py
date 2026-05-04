"""Conversation history — list, fetch, rename, delete. Messages get created
inside /v1/chat (not via these routes) so the chat endpoint stays the single
write path for chat content."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api.auth.bootstrap import Identity
from evarx_api.auth.dependencies import get_current_identity
from evarx_api.conversations.models import Conversation, Message
from evarx_api.core.db import get_session

log = structlog.get_logger()
router = APIRouter(prefix="/v1/conversations", tags=["conversations"])


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: str
    content: str
    citations: list
    created_at: datetime


class ConversationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    agent_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class ConversationDetail(ConversationRead):
    messages: list[MessageRead]


class ConversationCreate(BaseModel):
    title: Annotated[str, Field(default="New chat", max_length=200)] = "New chat"
    agent_id: uuid.UUID | None = None


class ConversationUpdate(BaseModel):
    title: Annotated[str, Field(min_length=1, max_length=200)]


@router.get("", response_model=list[ConversationRead])
async def list_conversations(
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
    limit: int = 50,
) -> list[Conversation]:
    rows = (
        await db.execute(
            select(Conversation)
            .where(
                Conversation.org_id == identity.org.id,
                Conversation.user_id == identity.user.id,
            )
            .order_by(Conversation.updated_at.desc())
            .limit(min(limit, 200))
        )
    ).scalars().all()
    return list(rows)


@router.post("", response_model=ConversationRead, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    payload: ConversationCreate,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> Conversation:
    if payload.agent_id is not None:
        # Validate agent belongs to caller's org.
        from evarx_api.agents.models import Agent

        owns = (
            await db.execute(
                select(Agent.id).where(
                    Agent.id == payload.agent_id,
                    Agent.org_id == identity.org.id,
                )
            )
        ).scalar_one_or_none()
        if owns is None:
            raise HTTPException(status_code=400, detail="Unknown agent_id")

    convo = Conversation(
        id=uuid.uuid4(),
        org_id=identity.org.id,
        user_id=identity.user.id,
        agent_id=payload.agent_id,
        title=payload.title or "New chat",
    )
    db.add(convo)
    await db.commit()
    await db.refresh(convo)
    return convo


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: uuid.UUID,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> ConversationDetail:
    convo = (
        await db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == identity.user.id,
            )
        )
    ).scalar_one_or_none()
    if convo is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = (
        await db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
    ).scalars().all()

    return ConversationDetail(
        id=convo.id,
        title=convo.title,
        agent_id=convo.agent_id,
        created_at=convo.created_at,
        updated_at=convo.updated_at,
        messages=[MessageRead.model_validate(m) for m in messages],
    )


@router.patch("/{conversation_id}", response_model=ConversationRead)
async def rename_conversation(
    conversation_id: uuid.UUID,
    payload: ConversationUpdate,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> Conversation:
    convo = (
        await db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == identity.user.id,
            )
        )
    ).scalar_one_or_none()
    if convo is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    convo.title = payload.title.strip()
    convo.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(convo)
    return convo


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: uuid.UUID,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> None:
    convo = (
        await db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == identity.user.id,
            )
        )
    ).scalar_one_or_none()
    if convo is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await db.delete(convo)
    await db.commit()

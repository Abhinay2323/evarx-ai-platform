"""Named retrieval-scoped agents — CRUD scoped to caller's org."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api.agents.models import Agent, AgentDocument
from evarx_api.agents.templates import AgentTemplate, all_templates
from evarx_api.auth.bootstrap import Identity
from evarx_api.auth.dependencies import get_current_identity
from evarx_api.core.db import get_session
from evarx_api.documents.models import Document

log = structlog.get_logger()
router = APIRouter(prefix="/v1/agents", tags=["agents"])
templates_router = APIRouter(prefix="/v1/agent-templates", tags=["agents"])


@templates_router.get("", response_model=list[AgentTemplate])
async def list_templates(
    _identity: Identity = Depends(get_current_identity),
) -> list[AgentTemplate]:
    return all_templates()


_MODEL_ALIASES = {"evarx-standard", "evarx-medical"}


class AgentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    system_prompt_addendum: str | None
    preferred_model: str
    document_ids: list[uuid.UUID]
    created_at: datetime
    updated_at: datetime


class AgentWrite(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=120)]
    description: str | None = Field(default=None, max_length=2000)
    system_prompt_addendum: str | None = Field(default=None, max_length=4000)
    preferred_model: str = Field(default="evarx-medical", max_length=60)
    document_ids: list[uuid.UUID] = Field(default_factory=list)


def _validate_model(model: str) -> str:
    if model not in _MODEL_ALIASES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown preferred_model {model!r}. Allowed: {sorted(_MODEL_ALIASES)}",
        )
    return model


async def _validate_doc_ids(
    db: AsyncSession, org_id: uuid.UUID, doc_ids: list[uuid.UUID]
) -> set[uuid.UUID]:
    if not doc_ids:
        return set()
    rows = (
        await db.execute(
            select(Document.id).where(
                Document.org_id == org_id,
                Document.id.in_(doc_ids),
            )
        )
    ).all()
    valid = {r[0] for r in rows}
    missing = set(doc_ids) - valid
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown document_ids: {sorted(str(m) for m in missing)}",
        )
    return valid


def _to_read(agent: Agent, doc_ids: list[uuid.UUID]) -> AgentRead:
    return AgentRead(
        id=agent.id,
        name=agent.name,
        description=agent.description,
        system_prompt_addendum=agent.system_prompt_addendum,
        preferred_model=agent.preferred_model,
        document_ids=doc_ids,
        created_at=agent.created_at,
        updated_at=agent.updated_at,
    )


@router.get("", response_model=list[AgentRead])
async def list_agents(
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> list[AgentRead]:
    agents = (
        await db.execute(
            select(Agent)
            .where(Agent.org_id == identity.org.id)
            .order_by(Agent.created_at.desc())
        )
    ).scalars().all()

    if not agents:
        return []

    doc_rows = (
        await db.execute(
            select(AgentDocument.agent_id, AgentDocument.document_id).where(
                AgentDocument.agent_id.in_([a.id for a in agents])
            )
        )
    ).all()
    by_agent: dict[uuid.UUID, list[uuid.UUID]] = {}
    for agent_id, doc_id in doc_rows:
        by_agent.setdefault(agent_id, []).append(doc_id)

    return [_to_read(a, by_agent.get(a.id, [])) for a in agents]


@router.post("", response_model=AgentRead, status_code=status.HTTP_201_CREATED)
async def create_agent(
    payload: AgentWrite,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> AgentRead:
    valid_docs = await _validate_doc_ids(db, identity.org.id, payload.document_ids)
    _validate_model(payload.preferred_model)

    agent = Agent(
        id=uuid.uuid4(),
        org_id=identity.org.id,
        created_by=identity.user.id,
        name=payload.name.strip(),
        description=payload.description,
        system_prompt_addendum=payload.system_prompt_addendum,
        preferred_model=payload.preferred_model,
    )
    db.add(agent)
    db.add_all(
        [AgentDocument(agent_id=agent.id, document_id=d) for d in valid_docs]
    )
    await db.commit()
    await db.refresh(agent)
    return _to_read(agent, list(valid_docs))


@router.patch("/{agent_id}", response_model=AgentRead)
async def update_agent(
    agent_id: uuid.UUID,
    payload: AgentWrite,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> AgentRead:
    agent = (
        await db.execute(
            select(Agent).where(
                Agent.id == agent_id, Agent.org_id == identity.org.id
            )
        )
    ).scalar_one_or_none()
    if agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")

    valid_docs = await _validate_doc_ids(db, identity.org.id, payload.document_ids)
    _validate_model(payload.preferred_model)

    agent.name = payload.name.strip()
    agent.description = payload.description
    agent.system_prompt_addendum = payload.system_prompt_addendum
    agent.preferred_model = payload.preferred_model
    agent.updated_at = datetime.utcnow()

    await db.execute(
        delete(AgentDocument).where(AgentDocument.agent_id == agent.id)
    )
    db.add_all(
        [AgentDocument(agent_id=agent.id, document_id=d) for d in valid_docs]
    )
    await db.commit()
    await db.refresh(agent)
    return _to_read(agent, list(valid_docs))


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: uuid.UUID,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_session),
) -> None:
    agent = (
        await db.execute(
            select(Agent).where(
                Agent.id == agent_id, Agent.org_id == identity.org.id
            )
        )
    ).scalar_one_or_none()
    if agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    await db.delete(agent)
    await db.commit()

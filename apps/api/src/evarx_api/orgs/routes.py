from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from evarx_api.core.db import get_session
from evarx_api.orgs.models import Org
from evarx_api.orgs.schemas import OrgCreate, OrgRead

# Auth-gating + tenant filtering will be added in phase 1 once Supabase JWTs are
# wired up. For now this is a placeholder that returns the global list — do NOT
# enable in production without auth.
router = APIRouter(prefix="/v1/orgs", tags=["orgs"])


@router.get("", response_model=list[OrgRead])
async def list_orgs(db: AsyncSession = Depends(get_session)) -> list[Org]:
    result = await db.execute(select(Org).order_by(Org.created_at.desc()))
    return list(result.scalars().all())


@router.post("", response_model=OrgRead, status_code=status.HTTP_201_CREATED)
async def create_org(
    payload: OrgCreate, db: AsyncSession = Depends(get_session)
) -> Org:
    org = Org(name=payload.name, slug=payload.slug, plan=payload.plan)
    db.add(org)
    await db.commit()
    await db.refresh(org)
    return org

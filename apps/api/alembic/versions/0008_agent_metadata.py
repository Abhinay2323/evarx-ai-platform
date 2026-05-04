"""agents.function + inputs + outputs metadata

Revision ID: 0008
Revises: 0007
Create Date: 2026-05-04

"""
from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0008"
down_revision: str | None = "0007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "agents",
        sa.Column("function", sa.String(40), nullable=True),
    )
    op.add_column(
        "agents",
        sa.Column(
            "inputs", postgresql.JSONB, nullable=False, server_default="[]"
        ),
    )
    op.add_column(
        "agents",
        sa.Column(
            "outputs", postgresql.JSONB, nullable=False, server_default="[]"
        ),
    )


def downgrade() -> None:
    op.drop_column("agents", "outputs")
    op.drop_column("agents", "inputs")
    op.drop_column("agents", "function")

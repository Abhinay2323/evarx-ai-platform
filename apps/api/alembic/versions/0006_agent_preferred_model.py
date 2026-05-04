"""agents.preferred_model

Revision ID: 0006
Revises: 0005
Create Date: 2026-05-04

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0006"
down_revision: str | None = "0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "agents",
        sa.Column(
            "preferred_model",
            sa.String(60),
            nullable=False,
            server_default="evarx-medical",
        ),
    )


def downgrade() -> None:
    op.drop_column("agents", "preferred_model")

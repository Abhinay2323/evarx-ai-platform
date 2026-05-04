"""users.status — invite-only signup gating

Revision ID: 0007
Revises: 0006
Create Date: 2026-05-04

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0007"
down_revision: str | None = "0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "status",
            sa.String(20),
            nullable=False,
            server_default="active",
        ),
    )
    # Existing rows are active by default. New users created via the gated
    # bootstrap may set this to "pending".


def downgrade() -> None:
    op.drop_column("users", "status")

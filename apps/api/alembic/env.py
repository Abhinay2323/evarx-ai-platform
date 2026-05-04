import asyncio
import os
import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Make `src/` importable so `evarx_api.*` resolves
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from evarx_api.core.db import Base  # noqa: E402
from evarx_api.documents import models as _documents_models  # noqa: F401, E402
from evarx_api.logs import models as _logs_models  # noqa: F401, E402
from evarx_api.orgs import invites_models as _invites_models  # noqa: F401, E402
from evarx_api.orgs import models as _orgs_models  # noqa: F401, E402
from evarx_api.settings import get_settings  # noqa: E402

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Override sqlalchemy.url with our env-driven setting
db_url = os.getenv("DATABASE_URL", get_settings().database_url)
config.set_main_option("sqlalchemy.url", db_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=db_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())

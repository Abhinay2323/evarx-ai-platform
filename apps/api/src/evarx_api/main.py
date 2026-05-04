import logging
from contextlib import asynccontextmanager

import sentry_sdk
import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from evarx_api import __version__
from evarx_api.agents.routes import router as agents_router
from evarx_api.auth.routes import router as auth_router
from evarx_api.chat.authenticated import router as authenticated_chat_router
from evarx_api.chat.routes import router as chat_router
from evarx_api.conversations.routes import router as conversations_router
from evarx_api.documents.routes import router as documents_router
from evarx_api.health.routes import router as health_router
from evarx_api.logs.routes import router as audit_router
from evarx_api.orgs.members_routes import invites_root as invites_router
from evarx_api.orgs.members_routes import router as orgs_me_router
from evarx_api.orgs.routes import router as orgs_router
from evarx_api.settings import get_settings
from evarx_api.usage.routes import router as usage_router

settings = get_settings()


def _configure_logging() -> None:
    logging.basicConfig(level=settings.log_level)
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, settings.log_level, logging.INFO)
        ),
    )


def _configure_sentry() -> None:
    if settings.sentry_dsn:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            environment=settings.env,
            traces_sample_rate=0.1 if settings.env == "prod" else 0.0,
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    _configure_logging()
    _configure_sentry()
    log = structlog.get_logger()
    log.info("evarx_api.startup", env=settings.env, version=__version__)
    yield
    log.info("evarx_api.shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Evarx API",
        version=__version__,
        description="Backend for the Evarx platform — agents, RAG, fine-tuning, billing.",
        lifespan=lifespan,
        docs_url="/docs" if settings.env != "prod" else None,
        redoc_url=None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(orgs_router)
    app.include_router(chat_router)
    app.include_router(authenticated_chat_router)
    app.include_router(auth_router)
    app.include_router(documents_router)
    app.include_router(audit_router)
    app.include_router(usage_router)
    app.include_router(orgs_me_router)
    app.include_router(invites_router)
    app.include_router(agents_router)
    app.include_router(conversations_router)

    return app


app = create_app()

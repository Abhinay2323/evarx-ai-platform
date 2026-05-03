"""S3 client for document storage. Wraps aioboto3 in a small async API.

Bucket layout: s3://{S3_BUCKET}/orgs/{org_id}/docs/{document_id}/{filename}
We never expose the raw bucket key to clients — they reference documents by
UUID; the route handlers translate that to/from S3 keys.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

import aioboto3
import structlog

from evarx_api.settings import get_settings

log = structlog.get_logger()


class StorageError(Exception):
    """S3 operation failed."""


def object_key(*, org_id: str, document_id: str, filename: str) -> str:
    safe = filename.replace("/", "_").strip()
    return f"orgs/{org_id}/docs/{document_id}/{safe}"


@asynccontextmanager
async def _s3_client() -> AsyncIterator[Any]:
    settings = get_settings()
    if not (settings.aws_access_key_id and settings.aws_secret_access_key and settings.s3_bucket):
        raise StorageError("S3 not configured (AWS credentials or bucket missing)")

    session = aioboto3.Session(
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.aws_region,
    )
    async with session.client("s3") as client:
        yield client


async def upload_bytes(*, key: str, body: bytes, content_type: str) -> None:
    settings = get_settings()
    async with _s3_client() as s3:
        await s3.put_object(
            Bucket=settings.s3_bucket,
            Key=key,
            Body=body,
            ContentType=content_type,
        )


async def download_bytes(*, key: str) -> bytes:
    settings = get_settings()
    async with _s3_client() as s3:
        resp = await s3.get_object(Bucket=settings.s3_bucket, Key=key)
        async with resp["Body"] as stream:
            return await stream.read()


async def delete_object(*, key: str) -> None:
    settings = get_settings()
    async with _s3_client() as s3:
        await s3.delete_object(Bucket=settings.s3_bucket, Key=key)

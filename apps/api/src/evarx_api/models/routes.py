"""Model catalog — what's available to the chat picker.

This is metadata only. Actual routing happens at LiteLLM (infra/litellm/config.yaml).
The `evarx-medical` slot is the USP target — until the real fine-tuned weights
are deployed, both aliases route to Gemini 2.5 Flash. The status flag here
makes that visible in the UI.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from evarx_api.auth.bootstrap import Identity
from evarx_api.auth.dependencies import get_current_identity

router = APIRouter(prefix="/v1/models", tags=["models"])


class ModelInfo(BaseModel):
    id: str
    label: str
    kind: str  # "cloud" | "edge"
    description: str
    status_label: str  # "Live" | "Stand-in" | "Coming soon"
    available: bool
    recommended_for: list[str]


@router.get("", response_model=list[ModelInfo])
async def list_models(
    _identity: Identity = Depends(get_current_identity),
) -> list[ModelInfo]:
    return [
        ModelInfo(
            id="evarx-standard",
            label="Evarx Standard",
            kind="cloud",
            description=(
                "Cloud-hosted Gemini 2.5 Flash. Fast, broad medical knowledge, low "
                "cost per token. Best for ad-hoc questions and exploratory chats."
            ),
            status_label="Live",
            available=True,
            recommended_for=[
                "Literature lookups",
                "First-pass drafting",
                "General medical Q&A",
            ],
        ),
        ModelInfo(
            id="evarx-medical",
            label="Evarx Medical",
            kind="edge",
            description=(
                "Fine-tuned medical SLM, deployable on-prem or in your VPC. "
                "Stand-in routing to Gemini 2.5 Flash until the fine-tuned weights "
                "are deployed — UI and behavior are stable, only the routing line "
                "in litellm config changes."
            ),
            status_label="Stand-in",
            available=True,
            recommended_for=[
                "DPDP / HIPAA-bound workloads",
                "Deployment in customer perimeter",
                "Low-latency on-box inference",
            ],
        ),
    ]

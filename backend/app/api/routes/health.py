from typing import Literal

from fastapi import APIRouter, Request
from pydantic import BaseModel, Field

router = APIRouter(tags=["service"])


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: str
    version: str
    catalog_ready: bool = Field(serialization_alias="catalogReady")
    model_ready: bool = Field(serialization_alias="modelReady")


@router.get("/health", response_model=HealthResponse)
def health(request: Request) -> HealthResponse:
    settings = request.app.state.settings
    return HealthResponse(
        service=settings.app_name,
        version=settings.app_version,
        catalog_ready=hasattr(request.app.state, "catalog"),
        model_ready=hasattr(request.app.state, "recommender"),
    )

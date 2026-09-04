from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.router import api_router
from app.config import Settings, get_settings
from app.services.catalog import CatalogService


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved_settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        application.state.catalog = CatalogService.load(
            resolved_settings.assets_dir / "catalog.json.gz"
        )
        yield

    application = FastAPI(
        title=resolved_settings.app_name,
        version=resolved_settings.app_version,
        description="Movie catalog and personalized recommendations for Flashback.",
        lifespan=lifespan,
    )
    application.state.settings = resolved_settings
    application.add_middleware(
        CORSMiddleware,
        allow_origins=resolved_settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type"],
    )
    application.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=6)
    application.include_router(api_router)
    return application


app = create_app()

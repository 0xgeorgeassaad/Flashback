from __future__ import annotations

import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.config import Settings, get_settings
from app.services.catalog import CatalogService
from app.services.supabase import InvalidAccessTokenError, SupabaseRequestError

for thread_variable in ("OPENBLAS_NUM_THREADS", "OMP_NUM_THREADS", "MKL_NUM_THREADS"):
    os.environ.setdefault(thread_variable, "1")


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved_settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        from app.services.recommender import RecommenderService
        from app.services.supabase import SupabaseGateway

        application.state.catalog = CatalogService.load(
            resolved_settings.assets_dir / "catalog.json.gz"
        )
        application.state.recommender = RecommenderService.load(
            resolved_settings.assets_dir / "serving_model.npz",
            application.state.catalog,
        )
        application.state.supabase = None
        if (
            resolved_settings.supabase_url
            and resolved_settings.supabase_publishable_key
        ):
            application.state.supabase = SupabaseGateway(
                resolved_settings.supabase_url,
                resolved_settings.supabase_publishable_key,
            )
        try:
            yield
        finally:
            if application.state.supabase is not None:
                await application.state.supabase.close()

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
        allow_origin_regex=resolved_settings.cors_origin_regex,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )
    application.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=6)

    @application.exception_handler(InvalidAccessTokenError)
    async def invalid_token_handler(
        _request: Request,
        _error: InvalidAccessTokenError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "The session is invalid or expired"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    @application.exception_handler(SupabaseRequestError)
    async def supabase_error_handler(
        _request: Request,
        error: SupabaseRequestError,
    ) -> JSONResponse:
        return JSONResponse(status_code=error.status_code, content={"detail": error.detail})

    application.include_router(api_router)
    return application


app = create_app()

from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.movies import router as movies_router
from app.api.routes.recommendations import router as recommendations_router
from app.api.routes.user_data import router as user_data_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(movies_router)
api_router.include_router(recommendations_router)
api_router.include_router(user_data_router)

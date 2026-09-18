from typing import Annotated

from fastapi import APIRouter, Query, Request, Response

from app.api.dependencies import AuthenticatedUser
from app.schemas.movies import MoviesResponse

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("", response_model=MoviesResponse)
def list_movies(request: Request, _user: AuthenticatedUser) -> Response:
    catalog = request.app.state.catalog
    return Response(
        content=catalog.serialized_response,
        media_type="application/json",
        headers={"Cache-Control": "private, max-age=3600"},
    )


@router.get("/search", response_model=MoviesResponse)
def search_movies(
    request: Request,
    _user: AuthenticatedUser,
    query: Annotated[str, Query(alias="q", min_length=1, max_length=100)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> MoviesResponse:
    return MoviesResponse(movies=request.app.state.catalog.search(query, limit))

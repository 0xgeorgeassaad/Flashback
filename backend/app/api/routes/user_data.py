from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Request, Response, status

from app.api.dependencies import AuthenticatedUser
from app.schemas.movies import Movie
from app.schemas.user_data import (
    RecommendationSession,
    RecommendationSessionsResponse,
    SavedMovie,
    SavedMovieCreate,
    SavedMoviesResponse,
    SavedMovieUpdate,
    TasteSelectionResponse,
    TasteSelectionUpdate,
)

router = APIRouter(prefix="/me", tags=["account data"])


def _known_movie(request: Request, movie_id: int) -> Movie:
    entry = request.app.state.catalog.by_movie_id.get(movie_id)
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Movie {movie_id} is not in the recommendation catalog",
        )
    return entry.movie


def _saved_movie(request: Request, row: dict[str, Any]) -> SavedMovie:
    movie = _known_movie(request, int(row["movie_id"]))
    return SavedMovie.model_validate(
        {
            **movie.model_dump(),
            "watched": row["watched"],
            "saved_at": row["saved_at"],
        }
    )


@router.get("/selections", response_model=TasteSelectionResponse)
async def get_selections(
    request: Request,
    user: AuthenticatedUser,
) -> TasteSelectionResponse:
    rows = await request.app.state.supabase.data_request(
        "GET",
        "taste_selections",
        user.access_token,
        params={
            "select": "movie_id",
            "user_id": f"eq.{user.user_id}",
            "order": "selected_at.asc",
        },
    )
    return TasteSelectionResponse(
        movies=tuple(_known_movie(request, int(row["movie_id"])) for row in rows)
    )


@router.put("/selections", response_model=TasteSelectionResponse)
async def replace_selections(
    payload: TasteSelectionUpdate,
    request: Request,
    user: AuthenticatedUser,
) -> TasteSelectionResponse:
    movies = tuple(_known_movie(request, movie_id) for movie_id in payload.movie_ids)
    gateway = request.app.state.supabase
    await gateway.data_request(
        "DELETE",
        "taste_selections",
        user.access_token,
        params={"user_id": f"eq.{user.user_id}"},
    )
    if payload.movie_ids:
        await gateway.data_request(
            "POST",
            "taste_selections",
            user.access_token,
            payload=[
                {"user_id": user.user_id, "movie_id": movie_id}
                for movie_id in payload.movie_ids
            ],
        )
    return TasteSelectionResponse(movies=movies)


@router.get("/saved-movies", response_model=SavedMoviesResponse)
async def get_saved_movies(
    request: Request,
    user: AuthenticatedUser,
) -> SavedMoviesResponse:
    rows = await request.app.state.supabase.data_request(
        "GET",
        "saved_movies",
        user.access_token,
        params={
            "select": "movie_id,watched,saved_at",
            "user_id": f"eq.{user.user_id}",
            "order": "saved_at.desc",
        },
    )
    return SavedMoviesResponse(movies=tuple(_saved_movie(request, row) for row in rows))


@router.post(
    "/saved-movies",
    response_model=SavedMovie,
    status_code=status.HTTP_201_CREATED,
)
async def save_movie(
    payload: SavedMovieCreate,
    request: Request,
    user: AuthenticatedUser,
) -> SavedMovie:
    _known_movie(request, payload.movie_id)
    rows = await request.app.state.supabase.data_request(
        "POST",
        "saved_movies",
        user.access_token,
        payload={"user_id": user.user_id, "movie_id": payload.movie_id},
        prefer="resolution=merge-duplicates,return=representation",
    )
    if not isinstance(rows, list) or not rows:
        raise HTTPException(status_code=502, detail="Account data service returned no saved movie")
    return _saved_movie(request, rows[0])


@router.patch("/saved-movies/{movie_id}", response_model=SavedMovie)
async def update_saved_movie(
    movie_id: int,
    payload: SavedMovieUpdate,
    request: Request,
    user: AuthenticatedUser,
) -> SavedMovie:
    _known_movie(request, movie_id)
    rows = await request.app.state.supabase.data_request(
        "PATCH",
        "saved_movies",
        user.access_token,
        params={"user_id": f"eq.{user.user_id}", "movie_id": f"eq.{movie_id}"},
        payload={"watched": payload.watched},
        prefer="return=representation",
    )
    if not isinstance(rows, list) or not rows:
        raise HTTPException(status_code=404, detail="Saved movie was not found")
    return _saved_movie(request, rows[0])


@router.delete("/saved-movies/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_movie(
    movie_id: int,
    request: Request,
    user: AuthenticatedUser,
) -> Response:
    await request.app.state.supabase.data_request(
        "DELETE",
        "saved_movies",
        user.access_token,
        params={"user_id": f"eq.{user.user_id}", "movie_id": f"eq.{movie_id}"},
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/recommendation-sessions", response_model=RecommendationSessionsResponse)
async def get_recommendation_sessions(
    request: Request,
    user: AuthenticatedUser,
) -> RecommendationSessionsResponse:
    rows = await request.app.state.supabase.data_request(
        "GET",
        "recommendation_sessions",
        user.access_token,
        params={
            "select": "id,created_at,selected_movie_ids,selected_movies,recommendations",
            "user_id": f"eq.{user.user_id}",
            "order": "created_at.desc",
        },
    )
    return RecommendationSessionsResponse(
        sessions=tuple(RecommendationSession.model_validate(row) for row in rows)
    )


@router.post(
    "/recommendation-sessions",
    response_model=RecommendationSession,
    status_code=status.HTTP_201_CREATED,
)
async def save_recommendation_session(
    payload: RecommendationSession,
    request: Request,
    user: AuthenticatedUser,
) -> RecommendationSession:
    row = {
        "id": payload.id,
        "user_id": user.user_id,
        "created_at": payload.created_at.isoformat(),
        "selected_movie_ids": list(payload.selected_movie_ids),
        "selected_movies": (
            [movie.model_dump() for movie in payload.selected_movies]
            if payload.selected_movies is not None
            else None
        ),
        "recommendations": [
            movie.model_dump() for movie in payload.recommendations
        ],
    }
    rows = await request.app.state.supabase.data_request(
        "POST",
        "recommendation_sessions",
        user.access_token,
        payload=row,
        prefer="resolution=merge-duplicates,return=representation",
    )
    if not isinstance(rows, list) or not rows:
        raise HTTPException(status_code=502, detail="Account data service returned no session")
    return RecommendationSession.model_validate(rows[0])


@router.delete(
    "/recommendation-sessions/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_recommendation_session(
    session_id: str,
    request: Request,
    user: AuthenticatedUser,
) -> Response:
    await request.app.state.supabase.data_request(
        "DELETE",
        "recommendation_sessions",
        user.access_token,
        params={"user_id": f"eq.{user.user_id}", "id": f"eq.{session_id}"},
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/library", status_code=status.HTTP_204_NO_CONTENT)
async def clear_library(request: Request, user: AuthenticatedUser) -> Response:
    gateway = request.app.state.supabase
    for table in ("saved_movies", "recommendation_sessions"):
        await gateway.data_request(
            "DELETE",
            table,
            user.access_token,
            params={"user_id": f"eq.{user.user_id}"},
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)

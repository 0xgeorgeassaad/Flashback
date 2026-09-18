from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.movies import Movie, Recommendation


class TasteSelectionUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    movie_ids: tuple[int, ...] = Field(alias="movieIds")

    @field_validator("movie_ids")
    @classmethod
    def require_unique_movie_ids(cls, movie_ids: tuple[int, ...]) -> tuple[int, ...]:
        if len(movie_ids) != len(set(movie_ids)):
            raise ValueError("movieIds must not contain duplicates")
        return movie_ids


class TasteSelectionResponse(BaseModel):
    movies: tuple[Movie, ...]


class SavedMovieCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    movie_id: int = Field(alias="movieId")


class SavedMovieUpdate(BaseModel):
    watched: bool


class SavedMovie(Movie):
    model_config = ConfigDict(populate_by_name=True)

    watched: bool
    saved_at: datetime = Field(alias="savedAt")


class SavedMoviesResponse(BaseModel):
    movies: tuple[SavedMovie, ...]


class RecommendationSession(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(min_length=1, max_length=100)
    created_at: datetime = Field(alias="createdAt")
    selected_movie_ids: tuple[int, ...] = Field(alias="selectedMovieIds")
    selected_movies: tuple[Movie, ...] | None = Field(
        default=None,
        alias="selectedMovies",
    )
    recommendations: tuple[Recommendation, ...]


class RecommendationSessionsResponse(BaseModel):
    sessions: tuple[RecommendationSession, ...]

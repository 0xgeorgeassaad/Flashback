from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class Movie(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    movie_id: int = Field(serialization_alias="movieId")
    title: str
    genres: tuple[str, ...]
    tmdb_id: int | None = Field(default=None, serialization_alias="tmdbId")
    poster_path: str | None = Field(default=None, serialization_alias="posterPath")


class MoviesResponse(BaseModel):
    movies: tuple[Movie, ...]


class Recommendation(Movie):
    score: float


class RecommendationsResponse(BaseModel):
    recommendations: tuple[Recommendation, ...]

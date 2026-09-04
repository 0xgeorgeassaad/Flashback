from __future__ import annotations

from typing import Annotated, Literal, Self

from pydantic import BaseModel, Field, model_validator


class SelectedMovie(BaseModel):
    movie_id: int = Field(validation_alias="movieId")
    rating: Literal[5]


class RecommendRequest(BaseModel):
    movies: Annotated[list[SelectedMovie], Field(min_length=5, max_length=50)]

    @model_validator(mode="after")
    def selections_are_unique(self) -> Self:
        movie_ids = [movie.movie_id for movie in self.movies]
        if len(movie_ids) != len(set(movie_ids)):
            raise ValueError("Selected movie IDs must be unique")
        return self

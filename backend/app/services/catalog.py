from __future__ import annotations

import gzip
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.schemas.movies import Movie, MoviesResponse


@dataclass(frozen=True, slots=True)
class CatalogEntry:
    movie_index: int
    movie: Movie
    searchable_title: str


class CatalogService:
    def __init__(self, entries: tuple[CatalogEntry, ...]) -> None:
        if not entries:
            raise ValueError("Catalog must contain at least one movie")
        indexes = [entry.movie_index for entry in entries]
        if indexes != list(range(len(entries))):
            raise ValueError("Catalog movie indexes must be contiguous and ordered")
        movie_ids = [entry.movie.movie_id for entry in entries]
        if len(movie_ids) != len(set(movie_ids)):
            raise ValueError("Catalog contains duplicate MovieLens movie IDs")

        self.entries = entries
        self.by_movie_id = {entry.movie.movie_id: entry for entry in entries}
        response = MoviesResponse(movies=tuple(entry.movie for entry in entries))
        self.serialized_response = response.model_dump_json(by_alias=True).encode("utf-8")

    @classmethod
    def load(cls, path: Path) -> CatalogService:
        if not path.is_file():
            raise FileNotFoundError(f"Catalog asset does not exist: {path}")
        payload = json.loads(gzip.decompress(path.read_bytes()))
        raw_movies = payload.get("movies")
        if not isinstance(raw_movies, list):
            raise ValueError("Catalog asset must contain a movies list")
        entries = tuple(cls._parse_entry(raw_movie) for raw_movie in raw_movies)
        return cls(entries)

    @staticmethod
    def _parse_entry(raw_movie: dict[str, Any]) -> CatalogEntry:
        movie = Movie.model_validate(
            {
                "movie_id": raw_movie["movieId"],
                "title": raw_movie["title"],
                "genres": raw_movie["genres"],
                "tmdb_id": raw_movie.get("tmdbId"),
                "poster_path": raw_movie.get("posterPath"),
            }
        )
        return CatalogEntry(
            movie_index=int(raw_movie["movieIndex"]),
            movie=movie,
            searchable_title=movie.title.casefold(),
        )

    def search(self, query: str, limit: int) -> tuple[Movie, ...]:
        normalized_query = query.strip().casefold()
        if not normalized_query:
            return ()
        matches = (
            entry.movie for entry in self.entries if normalized_query in entry.searchable_title
        )
        results: list[Movie] = []
        for movie in matches:
            results.append(movie)
            if len(results) == limit:
                break
        return tuple(results)

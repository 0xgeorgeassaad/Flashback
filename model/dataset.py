from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import polars as pl

RATINGS_SCHEMA = {
    "userId": pl.Int32,
    "movieId": pl.Int32,
    "rating": pl.Float32,
    "timestamp": pl.Int64,
}

MOVIES_SCHEMA = {
    "movieId": pl.Int32,
    "title": pl.String,
    "genres": pl.String,
}

LINKS_SCHEMA = {
    "movieId": pl.Int32,
    "imdbId": pl.Int64,
    "tmdbId": pl.Int64,
}


@dataclass(frozen=True)
class DatasetPaths:
    root: Path
    ratings: Path
    movies: Path
    links: Path
    readme: Path

    @classmethod
    def from_directory(cls, root: Path) -> DatasetPaths:
        return cls(
            root=root,
            ratings=root / "ratings.csv",
            movies=root / "movies.csv",
            links=root / "links.csv",
            readme=root / "README.txt",
        )

    def validate(self) -> None:
        missing = [path.name for path in self.required_files() if not path.is_file()]
        if missing:
            raise FileNotFoundError(f"Dataset is missing required files: {missing}")

    def required_files(self) -> tuple[Path, ...]:
        return self.ratings, self.movies, self.links, self.readme


def scan_ratings(paths: DatasetPaths) -> pl.LazyFrame:
    return pl.scan_csv(paths.ratings, schema_overrides=RATINGS_SCHEMA)


def read_movies(paths: DatasetPaths) -> pl.DataFrame:
    return pl.read_csv(paths.movies, schema_overrides=MOVIES_SCHEMA).with_columns(
        pl.col("title")
        .str.extract(r"\((\d{4})\)$", group_index=1)
        .cast(pl.Int16, strict=False)
        .alias("year")
    )


def read_links(paths: DatasetPaths) -> pl.DataFrame:
    return pl.read_csv(paths.links, schema_overrides=LINKS_SCHEMA)

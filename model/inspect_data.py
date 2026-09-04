from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import polars as pl

from dataset import DatasetPaths, read_links, read_movies, scan_ratings
from download_data import ARCHIVE_NAME, md5_digest

DEFAULT_POSITIVE_THRESHOLD = 4.0


def distribution_summary(frame: pl.DataFrame, column: str) -> dict[str, int | float]:
    summary = frame.select(
        pl.col(column).min().alias("min"),
        pl.col(column).median().alias("median"),
        pl.col(column).quantile(0.9).alias("p90"),
        pl.col(column).max().alias("max"),
    ).row(0, named=True)
    return {key: value for key, value in summary.items() if value is not None}


def profile_dataset(paths: DatasetPaths, positive_threshold: float) -> dict[str, Any]:
    paths.validate()
    ratings = scan_ratings(paths)
    movies = read_movies(paths)
    links = read_links(paths)

    rating_overview = ratings.select(
        pl.len().alias("ratings"),
        pl.col("userId").n_unique().alias("users"),
        pl.col("movieId").n_unique().alias("movies_in_ratings"),
        pl.col("rating").min().alias("minimum_rating"),
        pl.col("rating").max().alias("maximum_rating"),
        pl.col("timestamp").min().alias("minimum_timestamp"),
        pl.col("timestamp").max().alias("maximum_timestamp"),
    ).collect(engine="streaming").row(0, named=True)

    rating_distribution = (
        ratings.group_by("rating")
        .len(name="count")
        .sort("rating")
        .collect(engine="streaming")
    )

    positives = ratings.filter(pl.col("rating") >= positive_threshold)
    positive_by_user = (
        positives.group_by("userId")
        .len(name="positive_ratings")
        .collect(engine="streaming")
    )
    positive_by_movie = (
        positives.group_by("movieId")
        .len(name="positive_ratings")
        .collect(engine="streaming")
    )

    duplicate_pairs = (
        ratings.group_by("userId", "movieId")
        .len()
        .filter(pl.col("len") > 1)
        .select(pl.len())
        .collect(engine="streaming")
        .item()
    )

    genre_distribution = (
        movies.select(pl.col("genres").str.split("|").alias("genre"))
        .explode("genre", empty_as_null=True)
        .group_by("genre")
        .len(name="movies")
        .sort("movies", descending=True)
    )

    archive = paths.root.parent / ARCHIVE_NAME
    archive_checksum = md5_digest(archive) if archive.is_file() else None

    return {
        "dataset": "MovieLens 20M",
        "archive_md5": archive_checksum,
        "positive_rating_threshold": positive_threshold,
        "records": {
            **rating_overview,
            "movie_rows": movies.height,
            "link_rows": links.height,
        },
        "quality": {
            "duplicate_user_movie_pairs": duplicate_pairs,
            "movies_without_release_year": movies["year"].null_count(),
            "movies_without_tmdb_id": links["tmdbId"].null_count(),
            "movies_without_link_row": movies.join(
                links.select("movieId"), on="movieId", how="anti"
            ).height,
        },
        "rating_distribution": [
            {"rating": row[0], "count": row[1]}
            for row in rating_distribution.iter_rows()
        ],
        "positive_interactions": {
            "count": int(positive_by_user["positive_ratings"].sum()),
            "users": positive_by_user.height,
            "movies": positive_by_movie.height,
            "users_with_at_least_5": positive_by_user.filter(
                pl.col("positive_ratings") >= 5
            ).height,
            "movies_with_at_least_5": positive_by_movie.filter(
                pl.col("positive_ratings") >= 5
            ).height,
            "by_user": distribution_summary(positive_by_user, "positive_ratings"),
            "by_movie": distribution_summary(positive_by_movie, "positive_ratings"),
        },
        "genres": [
            {"genre": row[0], "movies": row[1]}
            for row in genre_distribution.iter_rows()
        ],
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate and profile MovieLens 20M.")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=Path(__file__).parent / "raw_data" / "ml-20m",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).parent / "reports" / "data_profile.json",
    )
    parser.add_argument("--positive-threshold", type=float, default=DEFAULT_POSITIVE_THRESHOLD)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    profile = profile_dataset(DatasetPaths.from_directory(args.data_dir), args.positive_threshold)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(profile, indent=2) + "\n", encoding="utf-8")
    print(f"Data profile written to {args.output}")


if __name__ == "__main__":
    main()

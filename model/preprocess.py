from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import polars as pl

from dataset import DatasetPaths, scan_ratings
from download_data import ARCHIVE_NAME, md5_digest
from inspect_data import DEFAULT_POSITIVE_THRESHOLD

DEFAULT_MINIMUM_INTERACTIONS = 5


@dataclass(frozen=True)
class ProcessedDataset:
    train: pl.DataFrame
    validation: pl.DataFrame
    test: pl.DataFrame
    users: pl.DataFrame
    movies: pl.DataFrame
    report: dict[str, Any]


def interaction_core(interactions: pl.DataFrame, minimum_interactions: int) -> pl.DataFrame:
    if minimum_interactions < 1:
        raise ValueError("minimum_interactions must be at least 1")

    core = interactions
    while True:
        starting_rows = core.height
        users = (
            core.group_by("userId")
            .len(name="interactions")
            .filter(pl.col("interactions") >= minimum_interactions)
            .select("userId")
        )
        core = core.join(users, on="userId", how="semi")
        movies = (
            core.group_by("movieId")
            .len(name="interactions")
            .filter(pl.col("interactions") >= minimum_interactions)
            .select("movieId")
        )
        core = core.join(movies, on="movieId", how="semi")
        if core.height == starting_rows:
            return core


def split_interactions(interactions: pl.DataFrame) -> tuple[pl.DataFrame, ...]:
    users = (
        interactions.select("userId")
        .unique()
        .sort("userId")
        .with_row_index("user_index")
        .select(pl.col("user_index").cast(pl.Int32), "userId")
    )
    movies = (
        interactions.select("movieId")
        .unique()
        .sort("movieId")
        .with_row_index("movie_index")
        .select(pl.col("movie_index").cast(pl.Int32), "movieId")
    )
    indexed = (
        interactions.join(users, on="userId")
        .join(movies, on="movieId")
        .sort("user_index", "timestamp", "movieId")
        .with_columns(
            pl.int_range(pl.len()).over("user_index").alias("position"),
            pl.len().over("user_index").alias("user_interactions"),
        )
        .with_columns(pl.lit(1.0, dtype=pl.Float32).alias("weight"))
    )
    output_columns = [
        "user_index",
        "movie_index",
        "userId",
        "movieId",
        "rating",
        "timestamp",
        "weight",
    ]
    train = indexed.filter(pl.col("position") < pl.col("user_interactions") - 2).select(
        output_columns
    )
    validation = indexed.filter(
        pl.col("position") == pl.col("user_interactions") - 2
    ).select(output_columns)
    test = indexed.filter(pl.col("position") == pl.col("user_interactions") - 1).select(
        output_columns
    )
    return train, validation, test, users, movies


def _split_summary(split: pl.DataFrame, training_movies: pl.Series) -> dict[str, int]:
    return {
        "interactions": split.height,
        "users": split["user_index"].n_unique(),
        "movies": split["movie_index"].n_unique(),
        "interactions_with_training_movie": split.filter(
            pl.col("movie_index").is_in(training_movies.implode())
        ).height,
    }


def preprocess_dataset(
    ratings: pl.DataFrame,
    positive_threshold: float,
    minimum_interactions: int,
) -> ProcessedDataset:
    positives = ratings.filter(pl.col("rating") >= positive_threshold)
    core = interaction_core(positives, minimum_interactions)
    train, validation, test, users, movies = split_interactions(core)
    training_movies = train["movie_index"].unique()

    report = {
        "settings": {
            "positive_rating_threshold": positive_threshold,
            "minimum_user_interactions": minimum_interactions,
            "minimum_movie_interactions": minimum_interactions,
            "interaction_weight": "binary",
            "split": "chronological_leave_last_two",
            "timestamp_tie_breaker": "movieId_ascending",
        },
        "input": {
            "ratings": ratings.height,
            "positive_interactions": positives.height,
            "positive_users": positives["userId"].n_unique(),
            "positive_movies": positives["movieId"].n_unique(),
        },
        "core": {
            "interactions": core.height,
            "users": users.height,
            "movies": movies.height,
        },
        "splits": {
            "train": _split_summary(train, training_movies),
            "validation": _split_summary(validation, training_movies),
            "test": _split_summary(test, training_movies),
        },
    }
    return ProcessedDataset(train, validation, test, users, movies, report)


def write_processed_dataset(dataset: ProcessedDataset, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    dataset.train.write_parquet(output_dir / "train.parquet")
    dataset.validation.write_parquet(output_dir / "validation.parquet")
    dataset.test.write_parquet(output_dir / "test.parquet")
    dataset.users.write_parquet(output_dir / "users.parquet")
    dataset.movies.write_parquet(output_dir / "movies.parquet")


def parse_args() -> argparse.Namespace:
    model_dir = Path(__file__).parent
    parser = argparse.ArgumentParser(description="Preprocess MovieLens for implicit ALS.")
    parser.add_argument("--data-dir", type=Path, default=model_dir / "raw_data" / "ml-20m")
    parser.add_argument("--output-dir", type=Path, default=model_dir / "processed_data")
    parser.add_argument(
        "--report", type=Path, default=model_dir / "reports" / "preprocessing_report.json"
    )
    parser.add_argument("--positive-threshold", type=float, default=DEFAULT_POSITIVE_THRESHOLD)
    parser.add_argument(
        "--minimum-interactions", type=int, default=DEFAULT_MINIMUM_INTERACTIONS
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    paths = DatasetPaths.from_directory(args.data_dir)
    paths.validate()
    ratings = scan_ratings(paths).collect(engine="streaming")
    dataset = preprocess_dataset(ratings, args.positive_threshold, args.minimum_interactions)
    write_processed_dataset(dataset, args.output_dir)

    report = {
        "dataset": "MovieLens 20M",
        "archive_md5": md5_digest(paths.root.parent / ARCHIVE_NAME),
        **dataset.report,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"Processed data written to {args.output_dir}")
    print(f"Preprocessing report written to {args.report}")


if __name__ == "__main__":
    main()

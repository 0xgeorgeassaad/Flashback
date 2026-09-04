from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np
import polars as pl
from scipy.sparse import csr_matrix


@dataclass(frozen=True)
class InteractionData:
    train: pl.DataFrame
    validation: pl.DataFrame
    test: pl.DataFrame
    users: pl.DataFrame
    movies: pl.DataFrame

    @property
    def number_of_users(self) -> int:
        return self.users.height

    @property
    def number_of_movies(self) -> int:
        return self.movies.height


def load_interaction_data(data_dir: Path) -> InteractionData:
    filenames = {
        "train": data_dir / "train.parquet",
        "validation": data_dir / "validation.parquet",
        "test": data_dir / "test.parquet",
        "users": data_dir / "users.parquet",
        "movies": data_dir / "movies.parquet",
    }
    missing = [path.name for path in filenames.values() if not path.is_file()]
    if missing:
        raise FileNotFoundError(f"Processed data is missing required files: {missing}")
    return InteractionData(**{name: pl.read_parquet(path) for name, path in filenames.items()})


def build_user_movie_matrix(
    interactions: pl.DataFrame,
    number_of_users: int,
    number_of_movies: int,
) -> csr_matrix:
    matrix = csr_matrix(
        (
            interactions["weight"].to_numpy().astype(np.float32, copy=False),
            (
                interactions["user_index"].to_numpy(),
                interactions["movie_index"].to_numpy(),
            ),
        ),
        shape=(number_of_users, number_of_movies),
        dtype=np.float32,
    )
    matrix.sum_duplicates()
    matrix.sort_indices()
    return matrix


def targets_by_user(split: pl.DataFrame, number_of_users: int) -> np.ndarray:
    if split["user_index"].n_unique() != split.height:
        raise ValueError("Evaluation split must contain exactly one target per included user")
    targets = np.full(number_of_users, -1, dtype=np.int32)
    targets[split["user_index"].to_numpy()] = split["movie_index"].to_numpy()
    if np.any(targets < 0):
        raise ValueError("Evaluation split must contain a target for every user")
    return targets

from __future__ import annotations

import polars as pl
import pytest

from training_data import build_user_movie_matrix, targets_by_user


def test_build_user_movie_matrix_uses_indexes_and_weights() -> None:
    interactions = pl.DataFrame(
        {
            "user_index": [0, 0, 1],
            "movie_index": [1, 2, 0],
            "weight": [1.0, 1.0, 1.0],
        }
    )

    matrix = build_user_movie_matrix(interactions, number_of_users=2, number_of_movies=3)

    assert matrix.toarray().tolist() == [[0.0, 1.0, 1.0], [1.0, 0.0, 0.0]]


def test_targets_by_user_requires_one_target_per_user() -> None:
    split = pl.DataFrame({"user_index": [0, 0], "movie_index": [1, 2]})

    with pytest.raises(ValueError, match="exactly one"):
        targets_by_user(split, number_of_users=2)

from __future__ import annotations

import polars as pl
import pytest

from preprocess import interaction_core, preprocess_dataset


@pytest.fixture
def interactions() -> pl.DataFrame:
    rows = [
        (1, 10, 4.0, 100),
        (1, 11, 4.5, 200),
        (1, 12, 5.0, 300),
        (1, 13, 4.0, 400),
        (2, 12, 4.0, 100),
        (2, 13, 4.5, 200),
        (2, 10, 5.0, 300),
        (2, 11, 4.0, 400),
        (3, 10, 4.0, 100),
        (3, 12, 4.5, 200),
        (3, 11, 5.0, 300),
        (3, 13, 4.0, 400),
        (4, 99, 5.0, 500),
        (5, 10, 2.0, 500),
    ]
    return pl.DataFrame(
        rows,
        schema={
            "userId": pl.Int32,
            "movieId": pl.Int32,
            "rating": pl.Float32,
            "timestamp": pl.Int64,
        },
        orient="row",
    )


def test_interaction_core_rejects_invalid_minimum(interactions: pl.DataFrame) -> None:
    with pytest.raises(ValueError, match="at least 1"):
        interaction_core(interactions, 0)


def test_preprocessing_filters_and_splits_chronologically(
    interactions: pl.DataFrame,
) -> None:
    dataset = preprocess_dataset(
        interactions,
        positive_threshold=4.0,
        minimum_interactions=2,
    )

    assert dataset.users["userId"].to_list() == [1, 2, 3]
    assert dataset.movies["movieId"].to_list() == [10, 11, 12, 13]
    assert dataset.train.height == 6
    assert dataset.validation.height == 3
    assert dataset.test.height == 3
    assert dataset.validation["movieId"].to_list() == [12, 10, 11]
    assert dataset.test["movieId"].to_list() == [13, 11, 13]
    assert dataset.train["weight"].to_list() == [1.0] * 6
    assert dataset.report["core"] == {"interactions": 12, "users": 3, "movies": 4}
    assert dataset.report["splits"]["test"]["interactions_with_training_movie"] == 3


def test_timestamp_ties_use_movie_id_order() -> None:
    interactions = pl.DataFrame(
        {
            "userId": [1, 1, 1],
            "movieId": [12, 10, 11],
            "rating": [4.0, 4.0, 4.0],
            "timestamp": [100, 100, 100],
        }
    )

    dataset = preprocess_dataset(interactions, positive_threshold=4.0, minimum_interactions=1)

    assert dataset.train["movieId"].to_list() == [10]
    assert dataset.validation["movieId"].to_list() == [11]
    assert dataset.test["movieId"].to_list() == [12]

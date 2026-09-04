from __future__ import annotations

import numpy as np
import pytest
from implicit.cpu.als import AlternatingLeastSquares
from scipy.sparse import csr_matrix

from als_model import ALSConfig, recommend_in_batches, train_als


def test_als_trains_and_recommends_unseen_movies() -> None:
    matrix = csr_matrix(
        np.array(
            [
                [1, 1, 0, 0],
                [1, 0, 1, 0],
                [0, 1, 0, 1],
                [0, 0, 1, 1],
            ],
            dtype=np.float32,
        )
    )
    config = ALSConfig(
        name="test",
        factors=2,
        regularization=0.1,
        alpha=1.0,
        iterations=2,
        random_state=7,
    )

    model, training_seconds = train_als(matrix, config)
    recommendations, recommendation_seconds = recommend_in_batches(
        model, matrix, count=2, batch_size=2
    )

    assert recommendations.shape == (4, 2)
    for user_index, recommended in enumerate(recommendations):
        assert set(recommended).isdisjoint(matrix[user_index].indices)
    assert training_seconds >= 0
    assert recommendation_seconds >= 0


def test_batch_recommendation_validates_arguments() -> None:
    matrix = csr_matrix(np.eye(2, dtype=np.float32))
    model, _ = train_als(
        matrix,
        ALSConfig(name="test", factors=2, regularization=0.1, iterations=1),
    )

    with pytest.raises(ValueError, match="count"):
        recommend_in_batches(model, matrix, count=0)


def test_als_model_round_trip(tmp_path) -> None:
    matrix = csr_matrix(np.eye(3, dtype=np.float32))
    model, _ = train_als(
        matrix,
        ALSConfig(name="test", factors=2, regularization=0.1, iterations=1),
    )
    artifact = tmp_path / "model.npz"

    model.save(artifact)
    loaded = AlternatingLeastSquares.load(artifact)

    assert loaded.user_factors.shape == model.user_factors.shape
    assert loaded.item_factors.shape == model.item_factors.shape

from __future__ import annotations

import numpy as np
import pytest
from scipy.sparse import csr_matrix

from popularity import popularity_order, recommend_popular


def test_popularity_orders_by_count_then_movie_index() -> None:
    matrix = csr_matrix(
        np.array(
            [
                [1, 1, 0, 0],
                [1, 0, 1, 0],
                [0, 1, 0, 0],
            ],
            dtype=np.float32,
        )
    )

    order, counts = popularity_order(matrix)

    assert order.tolist() == [0, 1, 2]
    assert counts.tolist() == [2, 2, 1, 0]


def test_popularity_recommendations_exclude_seen_movies() -> None:
    matrix = csr_matrix(np.array([[1, 0, 0], [0, 1, 0]], dtype=np.float32))
    order = np.array([0, 1, 2], dtype=np.int32)

    recommendations = recommend_popular(matrix, order, 2)

    assert recommendations.tolist() == [[1, 2], [0, 2]]


def test_popularity_recommendations_reject_too_few_candidates() -> None:
    matrix = csr_matrix(np.array([[1, 0]], dtype=np.float32))

    with pytest.raises(ValueError, match="candidate catalog"):
        recommend_popular(matrix, np.array([0], dtype=np.int32), 2)

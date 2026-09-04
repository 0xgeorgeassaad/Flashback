from __future__ import annotations

import numpy as np
import pytest

from ranking import ranking_metrics


def test_ranking_metrics_measure_target_positions() -> None:
    recommendations = np.array([[4, 2, 1], [3, 2, 0], [1, 0, 2]])
    targets = np.array([4, 2, 9])

    metrics = ranking_metrics(recommendations, targets, (1, 3))

    assert metrics["recall_at_1"] == pytest.approx(1 / 3)
    assert metrics["recall_at_3"] == pytest.approx(2 / 3)
    assert metrics["ndcg_at_1"] == pytest.approx(1 / 3)
    assert metrics["ndcg_at_3"] == pytest.approx((1 + 1 / np.log2(3)) / 3)


def test_ranking_metrics_validate_shapes() -> None:
    with pytest.raises(ValueError, match="same users"):
        ranking_metrics(np.array([[1, 2]]), np.array([1, 2]), (1,))

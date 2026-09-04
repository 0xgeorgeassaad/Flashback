from __future__ import annotations

import pytest

from tune_als import select_best


def test_select_best_prefers_ndcg_then_recall() -> None:
    results = [
        {"name": "a", "metrics": {"ndcg_at_10": 0.2, "recall_at_10": 0.3}},
        {"name": "b", "metrics": {"ndcg_at_10": 0.2, "recall_at_10": 0.4}},
        {"name": "c", "metrics": {"ndcg_at_10": 0.1, "recall_at_10": 0.9}},
    ]

    assert select_best(results)["name"] == "b"


def test_select_best_requires_results() -> None:
    with pytest.raises(ValueError, match="At least one"):
        select_best([])

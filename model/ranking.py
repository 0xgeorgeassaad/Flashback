from __future__ import annotations

from collections.abc import Iterable

import numpy as np


def ranking_metrics(
    recommendations: np.ndarray,
    targets: np.ndarray,
    cutoffs: Iterable[int],
) -> dict[str, float]:
    if recommendations.ndim != 2:
        raise ValueError("recommendations must be a two-dimensional array")
    if recommendations.shape[0] != targets.shape[0]:
        raise ValueError("recommendations and targets must contain the same users")

    requested_cutoffs = sorted(set(cutoffs))
    if not requested_cutoffs or requested_cutoffs[0] < 1:
        raise ValueError("cutoffs must contain positive integers")
    if requested_cutoffs[-1] > recommendations.shape[1]:
        raise ValueError("largest cutoff exceeds the recommendation width")

    matches = recommendations == targets[:, None]
    has_match = matches.any(axis=1)
    ranks = np.where(has_match, matches.argmax(axis=1), recommendations.shape[1])

    metrics: dict[str, float] = {}
    for cutoff in requested_cutoffs:
        hits = ranks < cutoff
        metrics[f"recall_at_{cutoff}"] = float(hits.mean())
        gains = np.where(hits, 1.0 / np.log2(ranks + 2), 0.0)
        metrics[f"ndcg_at_{cutoff}"] = float(gains.mean())
    return metrics

from __future__ import annotations

from dataclasses import asdict, dataclass
from time import perf_counter

import numpy as np
from implicit.cpu.als import AlternatingLeastSquares
from scipy.sparse import csr_matrix


@dataclass(frozen=True)
class ALSConfig:
    name: str
    factors: int
    regularization: float
    alpha: float = 40.0
    iterations: int = 15
    random_state: int = 42

    def as_dict(self) -> dict[str, str | int | float]:
        return asdict(self)


def train_als(
    user_movies: csr_matrix,
    config: ALSConfig,
) -> tuple[AlternatingLeastSquares, float]:
    model = AlternatingLeastSquares(
        factors=config.factors,
        regularization=config.regularization,
        alpha=config.alpha,
        iterations=config.iterations,
        random_state=config.random_state,
        dtype=np.float32,
    )
    started = perf_counter()
    model.fit(user_movies, show_progress=False)
    return model, perf_counter() - started


def recommend_in_batches(
    model: AlternatingLeastSquares,
    user_movies: csr_matrix,
    count: int,
    batch_size: int = 2048,
) -> tuple[np.ndarray, float]:
    if count < 1:
        raise ValueError("count must be at least 1")
    if batch_size < 1:
        raise ValueError("batch_size must be at least 1")

    recommendations = np.empty((user_movies.shape[0], count), dtype=np.int32)
    started = perf_counter()
    for start in range(0, user_movies.shape[0], batch_size):
        stop = min(start + batch_size, user_movies.shape[0])
        user_indexes = np.arange(start, stop, dtype=np.int32)
        movie_indexes, _ = model.recommend(
            user_indexes,
            user_movies[start:stop],
            N=count,
            filter_already_liked_items=True,
        )
        recommendations[start:stop] = movie_indexes
    return recommendations, perf_counter() - started

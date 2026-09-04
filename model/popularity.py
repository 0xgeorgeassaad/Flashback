from __future__ import annotations

import numpy as np
from scipy.sparse import csr_matrix


def popularity_order(user_movies: csr_matrix) -> tuple[np.ndarray, np.ndarray]:
    counts = np.asarray(user_movies.sum(axis=0)).ravel().astype(np.int64)
    movie_indexes = np.arange(user_movies.shape[1], dtype=np.int32)
    order = np.lexsort((movie_indexes, -counts))
    return order[counts[order] > 0].astype(np.int32, copy=False), counts


def recommend_popular(user_movies: csr_matrix, order: np.ndarray, count: int) -> np.ndarray:
    if count < 1:
        raise ValueError("count must be at least 1")
    if order.size < count:
        raise ValueError("candidate catalog is smaller than the requested recommendation count")

    recommendations = np.empty((user_movies.shape[0], count), dtype=np.int32)
    for user_index in range(user_movies.shape[0]):
        row_start = user_movies.indptr[user_index]
        row_end = user_movies.indptr[user_index + 1]
        seen = set(user_movies.indices[row_start:row_end])
        selected: list[int] = []
        for movie_index in order:
            if movie_index not in seen:
                selected.append(movie_index)
                if len(selected) == count:
                    break
        if len(selected) != count:
            raise ValueError(f"Not enough unseen candidates for user {user_index}")
        recommendations[user_index] = selected
    return recommendations

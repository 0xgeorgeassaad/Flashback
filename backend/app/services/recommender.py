from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np

from app.schemas.movies import Recommendation
from app.services.catalog import CatalogService
from app.services.errors import UnknownMovieError


@dataclass(frozen=True, slots=True)
class RecommenderAssets:
    item_factors: np.ndarray
    movie_ids: np.ndarray
    popularity_order: np.ndarray
    factors: int
    regularization: float
    alpha: float


class RecommenderService:
    def __init__(self, assets: RecommenderAssets, catalog: CatalogService) -> None:
        if assets.item_factors.shape != (len(catalog.entries), assets.factors):
            raise ValueError("Item-factor dimensions do not match the catalog")
        catalog_movie_ids = np.array(
            [entry.movie.movie_id for entry in catalog.entries], dtype=np.int32
        )
        if not np.array_equal(assets.movie_ids, catalog_movie_ids):
            raise ValueError("Serving model movie IDs do not match the catalog order")
        if sorted(assets.popularity_order.tolist()) != list(range(len(catalog.entries))):
            raise ValueError("Popularity fallback must contain every movie index exactly once")

        self.assets = assets
        self.catalog = catalog
        self.movie_id_to_index = {
            int(movie_id): movie_index for movie_index, movie_id in enumerate(assets.movie_ids)
        }
        self.base_normal_equation = (
            assets.item_factors.T @ assets.item_factors
            + assets.regularization * np.eye(assets.factors, dtype=np.float32)
        )

    @classmethod
    def load(cls, path: Path, catalog: CatalogService) -> RecommenderService:
        if not path.is_file():
            raise FileNotFoundError(f"Serving model asset does not exist: {path}")
        with np.load(path, allow_pickle=False) as archive:
            assets = RecommenderAssets(
                item_factors=archive["item_factors"].astype(np.float32, copy=False),
                movie_ids=archive["movie_ids"].astype(np.int32, copy=False),
                popularity_order=archive["popularity_order"].astype(np.int32, copy=False),
                factors=int(archive["factors"]),
                regularization=float(archive["regularization"]),
                alpha=float(archive["alpha"]),
            )
        return cls(assets, catalog)

    def recommend(self, movie_ids: list[int], count: int) -> tuple[Recommendation, ...]:
        unknown = sorted(
            {movie_id for movie_id in movie_ids if movie_id not in self.movie_id_to_index}
        )
        if unknown:
            raise UnknownMovieError(unknown)
        if count < 1:
            raise ValueError("Recommendation count must be positive")

        selected_indexes = np.array(
            [self.movie_id_to_index[movie_id] for movie_id in movie_ids], dtype=np.int32
        )
        selected_factors = self.assets.item_factors[selected_indexes]
        normal_equation = self.base_normal_equation + (self.assets.alpha - 1.0) * (
            selected_factors.T @ selected_factors
        )
        preference_vector = self.assets.alpha * selected_factors.sum(axis=0)
        user_factor = np.linalg.solve(normal_equation, preference_vector)

        scores = self.assets.item_factors @ user_factor
        scores[selected_indexes] = -np.inf
        recommended_indexes = np.argsort(-scores, kind="stable")[:count]
        recommended_scores = scores[recommended_indexes]

        if recommended_indexes.size != count or np.any(~np.isfinite(recommended_scores)):
            raise RuntimeError("Model returned fewer recommendations than requested")

        return tuple(
            Recommendation(
                **self.catalog.entries[int(movie_index)].movie.model_dump(),
                score=float(score),
            )
            for movie_index, score in zip(
                recommended_indexes, recommended_scores, strict=True
            )
        )

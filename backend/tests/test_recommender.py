from __future__ import annotations

import math
from pathlib import Path

import pytest

from app.services.catalog import CatalogService
from app.services.errors import UnknownMovieError
from app.services.recommender import RecommenderService

ASSETS_DIR = Path(__file__).parents[1] / "app" / "assets"


@pytest.fixture(scope="module")
def recommender() -> RecommenderService:
    catalog = CatalogService.load(ASSETS_DIR / "catalog.json.gz")
    return RecommenderService.load(ASSETS_DIR / "serving_model.npz", catalog)


def test_recommender_returns_ranked_unseen_movies(
    recommender: RecommenderService,
) -> None:
    selected = [1, 260, 318, 527, 1196]

    recommendations = recommender.recommend(selected, count=5)

    assert len(recommendations) == 5
    assert set(movie.movie_id for movie in recommendations).isdisjoint(selected)
    assert all(math.isfinite(movie.score) for movie in recommendations)
    assert [movie.score for movie in recommendations] == sorted(
        [movie.score for movie in recommendations], reverse=True
    )


def test_recommender_rejects_unknown_movie(recommender: RecommenderService) -> None:
    with pytest.raises(UnknownMovieError) as error:
        recommender.recommend([1, 260, 318, 527, 999_999], count=5)

    assert error.value.movie_ids == [999_999]

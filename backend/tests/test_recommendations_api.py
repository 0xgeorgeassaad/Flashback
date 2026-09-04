from __future__ import annotations

from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def selected_payload(movie_ids: list[int]) -> dict[str, list[dict[str, int]]]:
    return {"movies": [{"movieId": movie_id, "rating": 5} for movie_id in movie_ids]}


def test_recommend_returns_five_enriched_unseen_movies() -> None:
    application = create_app(Settings(environment="test"))
    selected = [1, 260, 318, 527, 1196]

    with TestClient(application) as client:
        response = client.post("/recommend", json=selected_payload(selected))

    payload = response.json()
    assert response.status_code == 200
    assert len(payload["recommendations"]) == 5
    assert {movie["movieId"] for movie in payload["recommendations"]}.isdisjoint(selected)
    assert all(
        {"movieId", "title", "genres", "tmdbId", "posterPath", "score"} == set(movie)
        for movie in payload["recommendations"]
    )
    assert [movie["score"] for movie in payload["recommendations"]] == sorted(
        [movie["score"] for movie in payload["recommendations"]], reverse=True
    )


def test_recommend_rejects_too_few_or_duplicate_selections() -> None:
    application = create_app(Settings(environment="test"))

    with TestClient(application) as client:
        too_few = client.post("/recommend", json=selected_payload([1, 260, 318, 527]))
        duplicate = client.post("/recommend", json=selected_payload([1, 260, 318, 527, 527]))

    assert too_few.status_code == 422
    assert duplicate.status_code == 422


def test_recommend_rejects_unknown_movie_id() -> None:
    application = create_app(Settings(environment="test"))

    with TestClient(application) as client:
        response = client.post(
            "/recommend", json=selected_payload([1, 260, 318, 527, 999_999])
        )

    assert response.status_code == 422
    assert response.json()["detail"]["movieIds"] == [999_999]


def test_recommend_requires_positive_rating_value() -> None:
    application = create_app(Settings(environment="test"))
    payload = selected_payload([1, 260, 318, 527, 1196])
    payload["movies"][0]["rating"] = 4

    with TestClient(application) as client:
        response = client.post("/recommend", json=payload)

    assert response.status_code == 422

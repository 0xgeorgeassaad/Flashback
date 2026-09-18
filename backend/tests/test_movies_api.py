from __future__ import annotations

from fastapi.testclient import TestClient

from app.api.dependencies import CurrentUser, require_user
from app.config import Settings
from app.main import create_app


def authenticated_app():
    application = create_app(Settings(environment="test"))
    application.dependency_overrides[require_user] = lambda: CurrentUser(
        user_id="test-user",
        email="test@example.com",
        access_token="test-token",
    )
    return application


def test_movies_returns_complete_serving_catalog() -> None:
    application = authenticated_app()

    with TestClient(application) as client:
        response = client.get("/movies")

    payload = response.json()
    assert response.status_code == 200
    assert response.headers["cache-control"] == "private, max-age=3600"
    assert len(payload["movies"]) == 13_680
    assert payload["movies"][0] == {
        "movieId": 1,
        "title": "Toy Story (1995)",
        "genres": ["Adventure", "Animation", "Children", "Comedy", "Fantasy"],
        "tmdbId": 862,
        "posterPath": "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
    }
    assert "movieIndex" not in payload["movies"][0]


def test_movie_search_is_case_insensitive_and_limited() -> None:
    application = authenticated_app()

    with TestClient(application) as client:
        response = client.get("/movies/search", params={"q": "toy story", "limit": 2})

    payload = response.json()
    assert response.status_code == 200
    assert len(payload["movies"]) == 2
    assert all("toy story" in movie["title"].casefold() for movie in payload["movies"])


def test_movie_search_validates_limit() -> None:
    application = authenticated_app()

    with TestClient(application) as client:
        response = client.get("/movies/search", params={"q": "toy", "limit": 101})

    assert response.status_code == 422

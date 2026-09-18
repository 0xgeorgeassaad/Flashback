from __future__ import annotations

from typing import Any

from fastapi.testclient import TestClient

from app.api.dependencies import CurrentUser, require_user
from app.config import Settings
from app.main import create_app


class FakeSupabaseGateway:
    def __init__(self) -> None:
        self.requests: list[tuple[str, str, Any]] = []

    async def close(self) -> None:
        pass

    async def get_user(self, access_token: str) -> dict[str, str]:
        assert access_token == "test-token"
        return {
            "id": "00000000-0000-0000-0000-000000000001",
            "email": "test@example.com",
        }

    async def data_request(
        self,
        method: str,
        table: str,
        _access_token: str,
        *,
        params: dict[str, str] | None = None,
        payload: Any = None,
        prefer: str | None = None,
    ) -> Any:
        self.requests.append((method, table, payload))
        if method == "GET" and table == "taste_selections":
            return [{"movie_id": 1}, {"movie_id": 260}]
        if method == "POST" and table == "saved_movies":
            return [
                {
                    "movie_id": payload["movie_id"],
                    "watched": False,
                    "saved_at": "2026-09-18T12:00:00Z",
                }
            ]
        return None


def authenticated_app():
    application = create_app(Settings(environment="test"))
    application.dependency_overrides[require_user] = lambda: CurrentUser(
        user_id="00000000-0000-0000-0000-000000000001",
        email="test@example.com",
        access_token="test-token",
    )
    return application


def test_get_taste_selections_enriches_catalog_movies() -> None:
    application = authenticated_app()

    with TestClient(application) as client:
        application.state.supabase = FakeSupabaseGateway()
        response = client.get("/me/selections")

    assert response.status_code == 200
    assert [movie["movieId"] for movie in response.json()["movies"]] == [1, 260]


def test_bearer_token_authenticates_without_a_dependency_override() -> None:
    application = create_app(Settings(environment="test"))

    with TestClient(application) as client:
        application.state.supabase = FakeSupabaseGateway()
        response = client.get(
            "/movies/search",
            params={"q": "toy story", "limit": 1},
            headers={"Authorization": "Bearer test-token"},
        )

    assert response.status_code == 200
    assert response.json()["movies"][0]["movieId"] == 1


def test_save_movie_returns_enriched_account_record() -> None:
    application = authenticated_app()

    with TestClient(application) as client:
        gateway = FakeSupabaseGateway()
        application.state.supabase = gateway
        response = client.post("/me/saved-movies", json={"movieId": 1})

    assert response.status_code == 201
    assert response.json() == {
        "movieId": 1,
        "title": "Toy Story (1995)",
        "genres": ["Adventure", "Animation", "Children", "Comedy", "Fantasy"],
        "tmdbId": 862,
        "posterPath": "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
        "watched": False,
        "savedAt": "2026-09-18T12:00:00Z",
    }
    assert gateway.requests[0][:2] == ("POST", "saved_movies")


def test_replace_taste_selections_rejects_unknown_movies_before_writing() -> None:
    application = authenticated_app()

    with TestClient(application) as client:
        gateway = FakeSupabaseGateway()
        application.state.supabase = gateway
        response = client.put("/me/selections", json={"movieIds": [1, 999_999]})

    assert response.status_code == 422
    assert gateway.requests == []

from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def test_health_reports_service_without_loaded_model() -> None:
    application = create_app(Settings(environment="test"))

    with TestClient(application) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "Flashback API",
        "version": "0.1.0",
        "modelReady": False,
    }


def test_cors_allows_configured_frontend() -> None:
    application = create_app(
        Settings(environment="test", cors_origins=["https://frontend.example"])
    )

    with TestClient(application) as client:
        response = client.options(
            "/health",
            headers={
                "Origin": "https://frontend.example",
                "Access-Control-Request-Method": "GET",
            },
        )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://frontend.example"

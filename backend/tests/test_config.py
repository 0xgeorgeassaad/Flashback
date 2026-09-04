from app.config import Settings


def test_settings_use_flashback_environment_prefix(monkeypatch) -> None:
    monkeypatch.setenv("FLASHBACK_ENVIRONMENT", "test")
    monkeypatch.setenv("FLASHBACK_CORS_ORIGINS", '["https://frontend.example"]')

    settings = Settings()

    assert settings.environment == "test"
    assert settings.cors_origins == ["https://frontend.example"]

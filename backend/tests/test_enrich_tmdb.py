from __future__ import annotations

import json
from pathlib import Path

import pytest

from scripts.enrich_tmdb import RateLimiter, apply_metadata, load_cache


def test_load_cache_uses_latest_record(tmp_path: Path) -> None:
    cache = tmp_path / "metadata.jsonl"
    cache.write_text(
        '\n'.join(
            [
                json.dumps({"tmdbId": 10, "posterPath": None}),
                json.dumps({"tmdbId": 10, "posterPath": "/poster.jpg"}),
            ]
        ),
        encoding="utf-8",
    )

    records = load_cache(cache)

    assert records[10]["posterPath"] == "/poster.jpg"


def test_load_cache_rejects_invalid_record(tmp_path: Path) -> None:
    cache = tmp_path / "metadata.jsonl"
    cache.write_text("not-json\n", encoding="utf-8")

    with pytest.raises(ValueError, match="line 1"):
        load_cache(cache)


def test_apply_metadata_counts_poster_coverage() -> None:
    catalog = {
        "movies": [
            {"movieId": 1, "tmdbId": 10, "posterPath": None},
            {"movieId": 2, "tmdbId": 20, "posterPath": None},
            {"movieId": 3, "tmdbId": None, "posterPath": None},
            {"movieId": 4, "tmdbId": 40, "posterPath": None},
        ]
    }
    metadata = {
        10: {"posterPath": "/poster.jpg"},
        20: {"posterPath": None},
    }

    counts = apply_metadata(catalog, metadata)

    assert counts == {
        "movies": 4,
        "with_tmdb_id": 3,
        "without_tmdb_id": 1,
        "with_poster_path": 1,
        "without_poster_path": 1,
        "unresolved": 1,
    }
    assert catalog["movies"][0]["posterPath"] == "/poster.jpg"


def test_rate_limiter_rejects_nonpositive_rate() -> None:
    with pytest.raises(ValueError, match="positive"):
        RateLimiter(0)

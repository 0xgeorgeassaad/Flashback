from __future__ import annotations

import gzip
import json
from pathlib import Path

import pytest

from app.services.catalog import CatalogEntry, CatalogService


def write_catalog(path: Path) -> None:
    payload = {
        "movies": [
            {
                "movieIndex": 0,
                "movieId": 10,
                "title": "Alpha Story (2000)",
                "genres": ["Drama"],
                "tmdbId": 100,
                "posterPath": "/alpha.jpg",
            },
            {
                "movieIndex": 1,
                "movieId": 20,
                "title": "Another Alpha (2001)",
                "genres": ["Comedy"],
                "tmdbId": None,
                "posterPath": None,
            },
        ]
    }
    path.write_bytes(gzip.compress(json.dumps(payload).encode(), mtime=0))


def test_catalog_loads_and_searches_case_insensitively(tmp_path: Path) -> None:
    catalog_path = tmp_path / "catalog.json.gz"
    write_catalog(catalog_path)

    catalog = CatalogService.load(catalog_path)

    assert len(catalog.entries) == 2
    assert catalog.by_movie_id[10].movie.poster_path == "/alpha.jpg"
    assert [movie.movie_id for movie in catalog.search("ALPHA", 1)] == [10]
    assert catalog.search("   ", 10) == ()


def test_catalog_rejects_noncontiguous_indexes(tmp_path: Path) -> None:
    catalog_path = tmp_path / "catalog.json.gz"
    write_catalog(catalog_path)
    catalog = CatalogService.load(catalog_path)
    invalid = CatalogEntry(
        movie_index=4,
        movie=catalog.entries[0].movie,
        searchable_title="alpha",
    )

    with pytest.raises(ValueError, match="contiguous"):
        CatalogService((invalid,))

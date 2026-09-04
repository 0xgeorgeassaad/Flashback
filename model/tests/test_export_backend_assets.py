from __future__ import annotations

import gzip
import json
from pathlib import Path

import polars as pl

from export_backend_assets import build_catalog, write_catalog


def test_build_catalog_joins_metadata_in_model_index_order() -> None:
    mapping = pl.DataFrame({"movie_index": [1, 0], "movieId": [20, 10]})
    movies = pl.DataFrame(
        {
            "movieId": [10, 20],
            "title": ["First (2000)", "Second (2001)"],
            "genres": ["Drama|Comedy", "Action"],
        }
    )
    links = pl.DataFrame({"movieId": [10, 20], "tmdbId": [100, None]})

    catalog = build_catalog(mapping, movies, links)

    assert [movie["movieId"] for movie in catalog] == [10, 20]
    assert catalog[0]["genres"] == ["Drama", "Comedy"]
    assert catalog[1]["tmdbId"] is None
    assert catalog[0]["posterPath"] is None


def test_write_catalog_creates_gzip_json(tmp_path: Path) -> None:
    output = tmp_path / "catalog.json.gz"
    movies = [{"movieId": 1, "title": "Example"}]

    write_catalog(output, movies)

    payload = json.loads(gzip.decompress(output.read_bytes()))
    assert payload == {"movies": movies}

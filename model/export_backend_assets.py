from __future__ import annotations

import argparse
import gzip
import hashlib
import json
from pathlib import Path
from typing import Any

import numpy as np
import polars as pl
from implicit.cpu.als import AlternatingLeastSquares

from dataset import DatasetPaths, read_links, read_movies
from popularity import popularity_order
from training_data import build_user_movie_matrix, load_interaction_data


def sha256_digest(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        while chunk := source.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def build_catalog(
    movie_mapping: pl.DataFrame,
    movies: pl.DataFrame,
    links: pl.DataFrame,
) -> list[dict[str, Any]]:
    joined = (
        movie_mapping.join(movies.select("movieId", "title", "genres"), on="movieId")
        .join(links.select("movieId", "tmdbId"), on="movieId", how="left")
        .sort("movie_index")
    )
    return [
        {
            "movieIndex": row["movie_index"],
            "movieId": row["movieId"],
            "title": row["title"],
            "genres": row["genres"].split("|"),
            "tmdbId": row["tmdbId"],
            "posterPath": None,
        }
        for row in joined.iter_rows(named=True)
    ]


def write_catalog(path: Path, movies: list[dict[str, Any]]) -> None:
    payload = json.dumps(
        {"movies": movies}, ensure_ascii=False, separators=(",", ":")
    ).encode("utf-8")
    path.write_bytes(gzip.compress(payload, compresslevel=9, mtime=0))


def parse_args() -> argparse.Namespace:
    model_dir = Path(__file__).parent
    parser = argparse.ArgumentParser(description="Export compact Flashback serving assets.")
    parser.add_argument(
        "--raw-data-dir", type=Path, default=model_dir / "raw_data" / "ml-20m"
    )
    parser.add_argument("--processed-data-dir", type=Path, default=model_dir / "processed_data")
    parser.add_argument(
        "--model", type=Path, default=model_dir / "artifacts" / "final" / "model.npz"
    )
    parser.add_argument(
        "--output-dir", type=Path, default=model_dir.parent / "backend" / "app" / "assets"
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    paths = DatasetPaths.from_directory(args.raw_data_dir)
    paths.validate()
    data = load_interaction_data(args.processed_data_dir)
    model = AlternatingLeastSquares.load(args.model)
    if model.item_factors.shape[0] != data.number_of_movies:
        raise ValueError("Model item factors do not match the movie mapping")

    final_training = pl.concat([data.train, data.validation])
    matrix = build_user_movie_matrix(
        final_training, data.number_of_users, data.number_of_movies
    )
    fallback_order, _ = popularity_order(matrix)
    catalog = build_catalog(data.movies, read_movies(paths), read_links(paths))

    args.output_dir.mkdir(parents=True, exist_ok=True)
    serving_model_path = args.output_dir / "serving_model.npz"
    catalog_path = args.output_dir / "catalog.json.gz"
    np.savez(
        serving_model_path,
        item_factors=model.item_factors.astype(np.float32, copy=False),
        movie_ids=data.movies.sort("movie_index")["movieId"].to_numpy(),
        popularity_order=fallback_order,
        factors=np.int32(model.factors),
        regularization=np.float32(model.regularization),
        alpha=np.float32(model.alpha),
    )
    write_catalog(catalog_path, catalog)

    manifest = {
        "format": "flashback_implicit_item_factors_v1",
        "movies": data.number_of_movies,
        "factors": model.factors,
        "source": {
            "model_sha256": sha256_digest(args.model),
            "model_movie_mapping_sha256": sha256_digest(
                args.processed_data_dir / "movies.parquet"
            ),
        },
        "files": {
            serving_model_path.name: sha256_digest(serving_model_path),
            catalog_path.name: sha256_digest(catalog_path),
        },
    }
    manifest_path = args.output_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Serving assets written to {args.output_dir}")


if __name__ == "__main__":
    main()

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

import polars as pl
from implicit.cpu.als import AlternatingLeastSquares

from als_model import ALSConfig, recommend_in_batches, train_als
from evaluate_popularity import DEFAULT_CUTOFFS
from popularity import popularity_order, recommend_popular
from ranking import ranking_metrics
from training_data import build_user_movie_matrix, load_interaction_data, targets_by_user


def load_selected_configuration(validation_report: Path) -> ALSConfig:
    report = json.loads(validation_report.read_text(encoding="utf-8"))
    return ALSConfig(**report["selected_configuration"])


def sha256_digest(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        while chunk := source.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def percentage_improvement(score: float, baseline: float) -> float:
    if baseline == 0:
        raise ValueError("baseline must be nonzero")
    return (score - baseline) / baseline * 100


def parse_args() -> argparse.Namespace:
    model_dir = Path(__file__).parent
    parser = argparse.ArgumentParser(description="Train and test the selected ALS model.")
    parser.add_argument("--data-dir", type=Path, default=model_dir / "processed_data")
    parser.add_argument(
        "--validation-report", type=Path, default=model_dir / "reports" / "als_validation.json"
    )
    parser.add_argument("--artifact-dir", type=Path, default=model_dir / "artifacts" / "final")
    parser.add_argument(
        "--report", type=Path, default=model_dir / "reports" / "final_test.json"
    )
    parser.add_argument("--batch-size", type=int, default=2048)
    return parser.parse_args()


def write_artifacts(
    model: AlternatingLeastSquares,
    artifact_dir: Path,
    users: pl.DataFrame,
    movies: pl.DataFrame,
    config: ALSConfig,
    training_interactions: int,
) -> dict[str, Any]:
    artifact_dir.mkdir(parents=True, exist_ok=True)
    model_path = artifact_dir / "model.npz"
    user_mapping_path = artifact_dir / "users.parquet"
    movie_mapping_path = artifact_dir / "movies.parquet"
    model.save(model_path)
    users.write_parquet(user_mapping_path)
    movies.write_parquet(movie_mapping_path)

    loaded_model = AlternatingLeastSquares.load(model_path)
    if loaded_model.user_factors.shape[0] != users.height:
        raise ValueError("Saved model user factors do not match the user mapping")
    if loaded_model.item_factors.shape[0] != movies.height:
        raise ValueError("Saved model item factors do not match the movie mapping")

    manifest = {
        "format": "implicit_native_npz",
        "configuration": config.as_dict(),
        "training_interactions": training_interactions,
        "users": users.height,
        "movies": movies.height,
        "files": {
            "model": {"name": model_path.name, "sha256": sha256_digest(model_path)},
            "users": {
                "name": user_mapping_path.name,
                "sha256": sha256_digest(user_mapping_path),
            },
            "movies": {
                "name": movie_mapping_path.name,
                "sha256": sha256_digest(movie_mapping_path),
            },
        },
    }
    manifest_path = artifact_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return manifest


def main() -> None:
    args = parse_args()
    data = load_interaction_data(args.data_dir)
    config = load_selected_configuration(args.validation_report)
    final_training = pl.concat([data.train, data.validation])
    matrix = build_user_movie_matrix(
        final_training, data.number_of_users, data.number_of_movies
    )
    targets = targets_by_user(data.test, data.number_of_users)
    maximum_cutoff = max(DEFAULT_CUTOFFS)

    popularity, _ = popularity_order(matrix)
    popularity_recommendations = recommend_popular(matrix, popularity, maximum_cutoff)
    popularity_metrics = ranking_metrics(
        popularity_recommendations, targets, DEFAULT_CUTOFFS
    )

    print(f"Training final model with {config.name}")
    model, training_seconds = train_als(matrix, config)
    recommendations, recommendation_seconds = recommend_in_batches(
        model, matrix, maximum_cutoff, args.batch_size
    )
    metrics = ranking_metrics(recommendations, targets, DEFAULT_CUTOFFS)
    manifest = write_artifacts(
        model,
        args.artifact_dir,
        data.users,
        data.movies,
        config,
        final_training.height,
    )

    report = {
        "model": "implicit_als",
        "configuration": config.as_dict(),
        "trained_on": "train_and_validation",
        "training_interactions": final_training.height,
        "evaluated_split": "test",
        "evaluation_users": data.number_of_users,
        "candidate_movies": data.number_of_movies,
        "cutoffs": list(DEFAULT_CUTOFFS),
        "training_seconds": round(training_seconds, 3),
        "recommendation_seconds": round(recommendation_seconds, 3),
        "popularity_baseline": popularity_metrics,
        "metrics": metrics,
        "improvement_over_popularity_percent": {
            metric: percentage_improvement(score, popularity_metrics[metric])
            for metric, score in metrics.items()
        },
        "artifact": {
            "directory": str(args.artifact_dir.relative_to(Path(__file__).parent)),
            "format": manifest["format"],
            "manifest": "manifest.json",
        },
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"Final test report written to {args.report}")
    print(f"Final model artifacts written to {args.artifact_dir}")


if __name__ == "__main__":
    main()

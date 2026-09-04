from __future__ import annotations

import argparse
import json
from importlib.metadata import version
from pathlib import Path
from typing import Any

from als_model import ALSConfig, recommend_in_batches, train_als
from evaluate_popularity import DEFAULT_CUTOFFS
from popularity import popularity_order, recommend_popular
from ranking import ranking_metrics
from training_data import build_user_movie_matrix, load_interaction_data, targets_by_user

CONFIGURATIONS = (
    ALSConfig(name="als_f64_r001", factors=64, regularization=0.01),
    ALSConfig(name="als_f64_r010", factors=64, regularization=0.10),
    ALSConfig(name="als_f128_r010", factors=128, regularization=0.10),
)
SELECTION_METRIC = "ndcg_at_10"


def select_best(results: list[dict[str, Any]]) -> dict[str, Any]:
    if not results:
        raise ValueError("At least one ALS result is required")
    return max(
        results,
        key=lambda result: (
            result["metrics"][SELECTION_METRIC],
            result["metrics"]["recall_at_10"],
        ),
    )


def parse_args() -> argparse.Namespace:
    model_dir = Path(__file__).parent
    parser = argparse.ArgumentParser(description="Tune implicit ALS on validation data.")
    parser.add_argument("--data-dir", type=Path, default=model_dir / "processed_data")
    parser.add_argument("--artifact-dir", type=Path, default=model_dir / "artifacts" / "tuning")
    parser.add_argument(
        "--report", type=Path, default=model_dir / "reports" / "als_validation.json"
    )
    parser.add_argument("--batch-size", type=int, default=2048)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data = load_interaction_data(args.data_dir)
    matrix = build_user_movie_matrix(data.train, data.number_of_users, data.number_of_movies)
    targets = targets_by_user(data.validation, data.number_of_users)
    maximum_cutoff = max(DEFAULT_CUTOFFS)

    popularity, _ = popularity_order(matrix)
    popularity_recommendations = recommend_popular(matrix, popularity, maximum_cutoff)
    popularity_metrics = ranking_metrics(
        popularity_recommendations, targets, DEFAULT_CUTOFFS
    )

    args.artifact_dir.mkdir(parents=True, exist_ok=True)
    results: list[dict[str, Any]] = []
    for config in CONFIGURATIONS:
        print(f"Training {config.name}")
        model, training_seconds = train_als(matrix, config)
        recommendations, recommendation_seconds = recommend_in_batches(
            model, matrix, maximum_cutoff, args.batch_size
        )
        metrics = ranking_metrics(recommendations, targets, DEFAULT_CUTOFFS)
        artifact = args.artifact_dir / f"{config.name}.npz"
        model.save(artifact)
        results.append(
            {
                "configuration": config.as_dict(),
                "training_seconds": round(training_seconds, 3),
                "recommendation_seconds": round(recommendation_seconds, 3),
                "metrics": metrics,
                "artifact": str(artifact.relative_to(Path(__file__).parent)),
            }
        )
        print(f"Completed {config.name}: {SELECTION_METRIC}={metrics[SELECTION_METRIC]:.6f}")

    best = select_best(results)
    report = {
        "model": "implicit_als",
        "package_versions": {
            "implicit": version("implicit"),
            "numpy": version("numpy"),
            "scipy": version("scipy"),
        },
        "evaluated_split": "validation",
        "evaluation_users": data.number_of_users,
        "candidate_movies": data.number_of_movies,
        "cutoffs": list(DEFAULT_CUTOFFS),
        "selection_metric": SELECTION_METRIC,
        "popularity_baseline": popularity_metrics,
        "results": results,
        "selected_configuration": best["configuration"],
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"Selected {best['configuration']['name']}")
    print(f"ALS validation report written to {args.report}")


if __name__ == "__main__":
    main()

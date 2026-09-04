from __future__ import annotations

import argparse
import json
from pathlib import Path

from popularity import popularity_order, recommend_popular
from ranking import ranking_metrics
from training_data import build_user_movie_matrix, load_interaction_data, targets_by_user

DEFAULT_CUTOFFS = (5, 10, 20)


def parse_args() -> argparse.Namespace:
    model_dir = Path(__file__).parent
    parser = argparse.ArgumentParser(description="Evaluate the popularity baseline.")
    parser.add_argument("--data-dir", type=Path, default=model_dir / "processed_data")
    parser.add_argument(
        "--report", type=Path, default=model_dir / "reports" / "popularity_validation.json"
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data = load_interaction_data(args.data_dir)
    matrix = build_user_movie_matrix(data.train, data.number_of_users, data.number_of_movies)
    order, counts = popularity_order(matrix)
    recommendations = recommend_popular(matrix, order, max(DEFAULT_CUTOFFS))
    targets = targets_by_user(data.validation, data.number_of_users)
    metrics = ranking_metrics(recommendations, targets, DEFAULT_CUTOFFS)

    movie_ids = dict(data.movies.select("movie_index", "movieId").iter_rows())
    report = {
        "model": "most_popular",
        "evaluated_split": "validation",
        "users": data.number_of_users,
        "candidate_movies": int(order.size),
        "excludes_training_history": True,
        "cutoffs": list(DEFAULT_CUTOFFS),
        "metrics": metrics,
        "top_movies": [
            {
                "movie_index": int(movie_index),
                "movieId": movie_ids[int(movie_index)],
                "training_interactions": int(counts[movie_index]),
            }
            for movie_index in order[:10]
        ],
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"Popularity validation report written to {args.report}")


if __name__ == "__main__":
    main()

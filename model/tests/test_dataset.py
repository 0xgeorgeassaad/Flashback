from __future__ import annotations

import csv
from pathlib import Path

import pytest

from dataset import DatasetPaths, read_links, read_movies, scan_ratings


def write_csv(path: Path, rows: list[list[object]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as output:
        csv.writer(output).writerows(rows)


@pytest.fixture
def sample_dataset(tmp_path: Path) -> DatasetPaths:
    write_csv(
        tmp_path / "ratings.csv",
        [
            ["userId", "movieId", "rating", "timestamp"],
            [1, 10, 4.5, 100],
            [1, 11, 3.0, 200],
            [2, 10, 5.0, 300],
        ],
    )
    write_csv(
        tmp_path / "movies.csv",
        [
            ["movieId", "title", "genres"],
            [10, "Example Film (1999)", "Drama|Sci-Fi"],
            [11, "Film Without Year", "Comedy"],
        ],
    )
    write_csv(
        tmp_path / "links.csv",
        [
            ["movieId", "imdbId", "tmdbId"],
            [10, 1234, 99],
            [11, 5678, ""],
        ],
    )
    (tmp_path / "README.txt").write_text("sample", encoding="utf-8")
    return DatasetPaths.from_directory(tmp_path)


def test_dataset_paths_reject_missing_files(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError, match="ratings.csv"):
        DatasetPaths.from_directory(tmp_path).validate()


def test_loaders_use_expected_types_and_parse_year(sample_dataset: DatasetPaths) -> None:
    sample_dataset.validate()
    ratings = scan_ratings(sample_dataset).collect()
    movies = read_movies(sample_dataset)
    links = read_links(sample_dataset)

    assert ratings.shape == (3, 4)
    assert movies["year"].to_list() == [1999, None]
    assert links["tmdbId"].to_list() == [99, None]

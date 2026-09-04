from __future__ import annotations

from dataset import DatasetPaths
from inspect_data import profile_dataset
from tests.test_dataset import sample_dataset

__all__ = ["sample_dataset"]


def test_profile_dataset_summarizes_interactions(sample_dataset: DatasetPaths) -> None:
    profile = profile_dataset(sample_dataset, positive_threshold=4.0)

    assert profile["records"]["ratings"] == 3
    assert profile["records"]["users"] == 2
    assert profile["records"]["movie_rows"] == 2
    assert profile["positive_interactions"]["count"] == 2
    assert profile["positive_interactions"]["users"] == 2
    assert profile["quality"]["movies_without_release_year"] == 1
    assert profile["quality"]["movies_without_tmdb_id"] == 1

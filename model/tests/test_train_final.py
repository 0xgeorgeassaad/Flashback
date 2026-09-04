from __future__ import annotations

import json
from pathlib import Path

import pytest

from train_final import load_selected_configuration, percentage_improvement, sha256_digest


def test_load_selected_configuration(tmp_path: Path) -> None:
    report = tmp_path / "validation.json"
    report.write_text(
        json.dumps(
            {
                "selected_configuration": {
                    "name": "chosen",
                    "factors": 32,
                    "regularization": 0.1,
                    "alpha": 20.0,
                    "iterations": 10,
                    "random_state": 9,
                }
            }
        ),
        encoding="utf-8",
    )

    config = load_selected_configuration(report)

    assert config.name == "chosen"
    assert config.factors == 32
    assert config.random_state == 9


def test_sha256_digest(tmp_path: Path) -> None:
    artifact = tmp_path / "artifact"
    artifact.write_bytes(b"flashback")

    assert sha256_digest(artifact) == (
        "167a4f0f9694f986519288811718cfd954020717c406ed4c9783fe2241e42e17"
    )


def test_percentage_improvement() -> None:
    assert percentage_improvement(0.15, 0.10) == pytest.approx(50.0)
    with pytest.raises(ValueError, match="nonzero"):
        percentage_improvement(0.15, 0.0)

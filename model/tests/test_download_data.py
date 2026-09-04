from __future__ import annotations

import hashlib
import zipfile
from pathlib import Path

import pytest

from download_data import (
    DATASET_DIRECTORY,
    REQUIRED_FILES,
    extract_required_files,
    md5_digest,
    verify_archive,
)


def test_md5_digest_and_verification(tmp_path: Path) -> None:
    archive = tmp_path / "sample.zip"
    archive.write_bytes(b"flashback")
    expected = hashlib.md5(b"flashback", usedforsecurity=False).hexdigest()

    assert md5_digest(archive) == expected
    verify_archive(archive, expected)


def test_verify_archive_rejects_mismatch(tmp_path: Path) -> None:
    archive = tmp_path / "sample.zip"
    archive.write_bytes(b"unexpected")

    with pytest.raises(ValueError, match="Checksum mismatch"):
        verify_archive(archive, "0" * 32)


def test_extract_required_files(tmp_path: Path) -> None:
    archive = tmp_path / "sample.zip"
    destination = tmp_path / "raw_data" / DATASET_DIRECTORY

    with zipfile.ZipFile(archive, "w") as output:
        for filename in REQUIRED_FILES:
            output.writestr(f"{DATASET_DIRECTORY}/{filename}", filename)

    extract_required_files(archive, destination)

    for filename in REQUIRED_FILES:
        assert (destination / filename).read_text() == filename


def test_extract_required_files_rejects_incomplete_archive(tmp_path: Path) -> None:
    archive = tmp_path / "sample.zip"
    destination = tmp_path / "raw_data" / DATASET_DIRECTORY

    with zipfile.ZipFile(archive, "w") as output:
        output.writestr(f"{DATASET_DIRECTORY}/README.txt", "missing csv files")

    with pytest.raises(ValueError, match="missing required files"):
        extract_required_files(archive, destination)

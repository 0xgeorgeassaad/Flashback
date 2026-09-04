from __future__ import annotations

import argparse
import hashlib
import shutil
import ssl
import urllib.request
import zipfile
from pathlib import Path, PurePosixPath

DATASET_URL = "https://files.grouplens.org/datasets/movielens/ml-20m.zip"
ARCHIVE_MD5 = "cd245b17a1ae2cc31bb14903e1204af3"
ARCHIVE_NAME = "ml-20m.zip"
DATASET_DIRECTORY = "ml-20m"
REQUIRED_FILES = ("README.txt", "links.csv", "movies.csv", "ratings.csv")
CHUNK_SIZE = 1024 * 1024
PROGRESS_INTERVAL = 25 * 1024 * 1024


def md5_digest(path: Path) -> str:
    digest = hashlib.md5(usedforsecurity=False)
    with path.open("rb") as file:
        while chunk := file.read(CHUNK_SIZE):
            digest.update(chunk)
    return digest.hexdigest()


def verify_archive(path: Path, expected_md5: str = ARCHIVE_MD5) -> None:
    actual_md5 = md5_digest(path)
    if actual_md5 != expected_md5:
        raise ValueError(
            f"Checksum mismatch for {path}: expected {expected_md5}, got {actual_md5}"
        )


def insecure_ssl_context() -> ssl.SSLContext:
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
    return context


def download_archive(url: str, destination: Path, allow_insecure: bool = False) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    partial = destination.with_suffix(f"{destination.suffix}.part")
    downloaded = partial.stat().st_size if partial.exists() else 0
    headers = {"User-Agent": "flashback-model/0.1"}
    if downloaded:
        headers["Range"] = f"bytes={downloaded}-"

    request = urllib.request.Request(url, headers=headers)
    context = insecure_ssl_context() if allow_insecure else None

    with urllib.request.urlopen(request, context=context) as response:
        is_resuming = downloaded > 0 and response.status == 206
        if downloaded and not is_resuming:
            downloaded = 0

        total = downloaded + int(response.headers.get("Content-Length", "0"))
        mode = "ab" if is_resuming else "wb"
        next_report = downloaded + PROGRESS_INTERVAL

        with partial.open(mode) as output:
            while chunk := response.read(CHUNK_SIZE):
                output.write(chunk)
                downloaded += len(chunk)
                if downloaded >= next_report:
                    current_mb = downloaded / 1024 / 1024
                    total_mb = total / 1024 / 1024
                    print(f"Downloaded {current_mb:.0f} of {total_mb:.0f} MB")
                    next_report = downloaded + PROGRESS_INTERVAL

    partial.replace(destination)


def required_archive_members() -> dict[str, str]:
    return {
        f"{DATASET_DIRECTORY}/{filename}": filename
        for filename in REQUIRED_FILES
    }


def extract_required_files(archive: Path, destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    members = required_archive_members()

    with zipfile.ZipFile(archive) as source:
        available = set(source.namelist())
        missing = set(members) - available
        if missing:
            raise ValueError(f"Archive is missing required files: {sorted(missing)}")

        for member, filename in members.items():
            member_path = PurePosixPath(member)
            if member_path.is_absolute() or ".." in member_path.parts:
                raise ValueError(f"Unsafe archive member: {member}")

            target = destination / filename
            with source.open(member) as input_file, target.open("wb") as output_file:
                shutil.copyfileobj(input_file, output_file, length=CHUNK_SIZE)


def prepare_dataset(
    raw_data_directory: Path,
    force: bool = False,
    allow_insecure_download: bool = False,
) -> Path:
    archive = raw_data_directory / ARCHIVE_NAME
    extracted = raw_data_directory / DATASET_DIRECTORY

    if force or not archive.exists():
        download_archive(DATASET_URL, archive, allow_insecure=allow_insecure_download)

    verify_archive(archive)

    if force or any(not (extracted / filename).exists() for filename in REQUIRED_FILES):
        extract_required_files(archive, extracted)

    return extracted


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download and verify the MovieLens 20M files used by Flashback."
    )
    parser.add_argument(
        "--raw-data-dir",
        type=Path,
        default=Path(__file__).parent / "raw_data",
        help="Directory for the archive and extracted data.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Download and extract again even when files already exist.",
    )
    parser.add_argument(
        "--allow-insecure-download",
        action="store_true",
        help=(
            "Disable TLS certificate verification for the official GroupLens download. "
            "The published archive checksum is still mandatory."
        ),
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    dataset_directory = prepare_dataset(
        args.raw_data_dir,
        force=args.force,
        allow_insecure_download=args.allow_insecure_download,
    )
    print(f"MovieLens 20M is ready at {dataset_directory}")


if __name__ == "__main__":
    main()

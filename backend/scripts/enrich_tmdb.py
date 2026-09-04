from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import os
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

TMDB_MOVIE_URL = "https://api.themoviedb.org/3/movie/{tmdb_id}?language=en-US"


@dataclass(frozen=True)
class RateLimiter:
    requests_per_second: float

    def __post_init__(self) -> None:
        if self.requests_per_second <= 0:
            raise ValueError("requests_per_second must be positive")
        object.__setattr__(self, "_lock", threading.Lock())
        object.__setattr__(self, "_next_request", 0.0)

    def wait(self) -> None:
        with self._lock:
            now = time.monotonic()
            scheduled = max(now, self._next_request)
            object.__setattr__(
                self, "_next_request", scheduled + 1 / self.requests_per_second
            )
        delay = scheduled - now
        if delay > 0:
            time.sleep(delay)


def read_catalog(path: Path) -> dict[str, Any]:
    return json.loads(gzip.decompress(path.read_bytes()))


def write_catalog(path: Path, catalog: dict[str, Any]) -> None:
    payload = json.dumps(catalog, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    path.write_bytes(gzip.compress(payload, compresslevel=9, mtime=0))


def load_cache(path: Path) -> dict[int, dict[str, Any]]:
    if not path.is_file():
        return {}
    records: dict[int, dict[str, Any]] = {}
    with path.open(encoding="utf-8") as source:
        for line_number, line in enumerate(source, start=1):
            if not line.strip():
                continue
            try:
                record = json.loads(line)
                records[int(record["tmdbId"])] = record
            except (KeyError, TypeError, ValueError, json.JSONDecodeError) as error:
                raise ValueError(f"Invalid cache record on line {line_number}") from error
    return records


def append_cache(path: Path, record: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as output:
        output.write(json.dumps(record, separators=(",", ":")) + "\n")


def fetch_movie_metadata(
    tmdb_id: int,
    token: str,
    limiter: RateLimiter,
    attempts: int = 5,
) -> dict[str, Any]:
    for attempt in range(attempts):
        limiter.wait()
        request = urllib.request.Request(
            TMDB_MOVIE_URL.format(tmdb_id=tmdb_id),
            headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        )
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                payload = json.load(response)
            poster_path = payload.get("poster_path")
            if poster_path is not None and not (
                isinstance(poster_path, str) and poster_path.startswith("/")
            ):
                raise ValueError(f"TMDB returned an invalid poster path for movie {tmdb_id}")
            return {
                "tmdbId": tmdb_id,
                "posterPath": poster_path,
                "status": "found" if poster_path else "no_poster",
            }
        except urllib.error.HTTPError as error:
            if error.code == 404:
                return {"tmdbId": tmdb_id, "posterPath": None, "status": "not_found"}
            if error.code in {401, 403}:
                raise RuntimeError("TMDB rejected the API Read Access Token") from error
            if error.code != 429 and error.code < 500:
                raise
            retry_after = error.headers.get("Retry-After")
            delay = float(retry_after) if retry_after else 2**attempt
        except urllib.error.URLError:
            delay = 2**attempt

        if attempt == attempts - 1:
            break
        time.sleep(delay)
    raise RuntimeError(f"TMDB metadata request failed after {attempts} attempts: {tmdb_id}")


def apply_metadata(
    catalog: dict[str, Any],
    metadata: dict[int, dict[str, Any]],
) -> dict[str, int]:
    counts = {
        "movies": 0,
        "with_tmdb_id": 0,
        "without_tmdb_id": 0,
        "with_poster_path": 0,
        "without_poster_path": 0,
        "unresolved": 0,
    }
    for movie in catalog["movies"]:
        counts["movies"] += 1
        tmdb_id = movie.get("tmdbId")
        if tmdb_id is None:
            counts["without_tmdb_id"] += 1
            movie["posterPath"] = None
            continue
        counts["with_tmdb_id"] += 1
        record = metadata.get(int(tmdb_id))
        if record is None:
            counts["unresolved"] += 1
            movie["posterPath"] = None
        else:
            movie["posterPath"] = record["posterPath"]
            key = "with_poster_path" if record["posterPath"] else "without_poster_path"
            counts[key] += 1
    return counts


def sha256_digest(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        while chunk := source.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def parse_args() -> argparse.Namespace:
    backend_dir = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description="Enrich the catalog with TMDB poster paths.")
    parser.add_argument(
        "--catalog", type=Path, default=backend_dir / "app" / "assets" / "catalog.json.gz"
    )
    parser.add_argument(
        "--cache", type=Path, default=backend_dir / ".cache" / "tmdb_metadata.jsonl"
    )
    parser.add_argument(
        "--report", type=Path, default=backend_dir / "reports" / "tmdb_enrichment.json"
    )
    parser.add_argument(
        "--manifest", type=Path, default=backend_dir / "app" / "assets" / "manifest.json"
    )
    parser.add_argument("--requests-per-second", type=float, default=20.0)
    parser.add_argument("--workers", type=int, default=8)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
    token = os.environ.get("TMDB_READ_ACCESS_TOKEN")
    if not token:
        raise RuntimeError("TMDB_READ_ACCESS_TOKEN is missing from backend/.env")

    catalog = read_catalog(args.catalog)
    cached = load_cache(args.cache)
    tmdb_ids = sorted(
        {int(movie["tmdbId"]) for movie in catalog["movies"] if movie.get("tmdbId") is not None}
    )
    pending = [tmdb_id for tmdb_id in tmdb_ids if tmdb_id not in cached]
    print(f"Cached {len(cached)} of {len(tmdb_ids)} TMDB records", flush=True)

    limiter = RateLimiter(args.requests_per_second)
    failures: list[tuple[int, str]] = []
    completed = 0
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {
            executor.submit(fetch_movie_metadata, tmdb_id, token, limiter): tmdb_id
            for tmdb_id in pending
        }
        for future in as_completed(futures):
            tmdb_id = futures[future]
            try:
                record = future.result()
            except Exception as error:
                failures.append((tmdb_id, str(error)))
            else:
                cached[tmdb_id] = record
                append_cache(args.cache, record)
            completed += 1
            if completed % 250 == 0 or completed == len(pending):
                print(
                    f"Processed {completed} of {len(pending)} pending records; "
                    f"failures={len(failures)}",
                    flush=True,
                )

    counts = apply_metadata(catalog, cached)
    write_catalog(args.catalog, catalog)
    report = {
        "source": "TMDB movie details API",
        "language": "en-US",
        "requests_per_second": args.requests_per_second,
        **counts,
        "request_failures": len(failures),
        "failed_tmdb_ids": [tmdb_id for tmdb_id, _ in failures],
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    manifest["files"][args.catalog.name] = sha256_digest(args.catalog)
    manifest["catalog_enrichment"] = {
        "source": report["source"],
        "with_poster_path": counts["with_poster_path"],
        "without_poster_path": counts["without_poster_path"],
    }
    args.manifest.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Catalog written to {args.catalog}", flush=True)
    print(f"Report written to {args.report}", flush=True)
    if failures:
        raise RuntimeError(f"{len(failures)} TMDB requests failed; rerun to retry them")


if __name__ == "__main__":
    main()

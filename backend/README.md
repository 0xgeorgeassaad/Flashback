# Flashback API

This directory contains the isolated FastAPI application that serves the Flashback frontend. It loads pre-trained recommendation artifacts and never trains the ALS model at runtime.

## Requirements

- Python 3.14
- `uv`

Install the locked environment:

```bash
cd backend
uv sync
```

Run the development server:

```bash
uv run fastapi dev
```

Open the interactive API documentation at [http://localhost:8000/docs](http://localhost:8000/docs).

## Checks

```bash
uv run pytest
uv run ruff check .
```

## API contract

| Endpoint | Purpose |
|---|---|
| `GET /health` | Report API and model readiness |
| `GET /movies` | Return the frontend movie catalog |
| `GET /movies/search` | Search catalog titles on the server |
| `POST /recommend` | Return five recommendations from selected movies |

`GET /movies` serves the complete 13,680-title model catalog from a validated startup cache. Responses are compressed and contain public MovieLens IDs rather than internal factor indexes. `GET /movies/search` accepts `q` and an optional `limit` from 1 to 100. The recommendation endpoint will be added in a separate, tested milestone.

## Configuration

Configuration uses environment variables prefixed with `FLASHBACK_`. Copy `.env.example` to `.env` for local overrides. Local `.env` files and FastAPI Cloud deployment state are ignored by Git.

FastAPI Cloud should use `backend` as the monorepo application directory. The configured entrypoint is `app.main:app`.

## One-time poster metadata enrichment

The committed catalog stores TMDB poster paths so runtime requests do not contact the TMDB metadata API. Add the API Read Access Token to the ignored `.env` file:

```env
TMDB_READ_ACCESS_TOKEN=your_token
```

Then run:

```bash
uv run python scripts/enrich_tmdb.py
```

The script requests movie-details JSON from TMDB, stores only `poster_path`, saves resumable progress in `.cache/`, and updates `app/assets/catalog.json.gz`. It does not download poster images. The frontend builds public image CDN URLs from the stored paths.

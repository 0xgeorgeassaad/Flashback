# Flashback API

This directory contains the isolated FastAPI application that serves the Flashback frontend. It loads pre-trained recommendation artifacts and never trains the ALS model at runtime. Serving uses NumPy to fold a visitor's selected movies into the trained factor space, so the deployed API does not require the native `implicit` or SciPy runtimes.

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

`GET /movies` serves the complete 13,680-title model catalog from a validated startup cache. Responses are compressed and contain public MovieLens IDs rather than internal factor indexes. `GET /movies/search` accepts `q` and an optional `limit` from 1 to 100.

`POST /recommend` accepts 5 to 50 unique model-supported movies. The first API version requires each selection to carry `rating: 5`, matching the binary positive interactions used during training. It calculates a temporary user factor, excludes all selected movies, and returns exactly five recommendations with model scores and catalog metadata.

Example request:

```json
{
  "movies": [
    {"movieId": 1, "rating": 5},
    {"movieId": 260, "rating": 5},
    {"movieId": 318, "rating": 5},
    {"movieId": 527, "rating": 5},
    {"movieId": 1196, "rating": 5}
  ]
}
```

## Configuration

Configuration uses environment variables prefixed with `FLASHBACK_`. Copy `.env.example` to `.env` for local overrides. Local `.env` files and FastAPI Cloud deployment state are ignored by Git.

FastAPI Cloud should use `backend` as the monorepo application directory. The configured entrypoint is `app.main:app`.

## Deploy to FastAPI Cloud

Run deployment commands from this directory so FastAPI Cloud uses the backend `pyproject.toml` and uv lockfile:

```bash
cd backend
uv run fastapi deploy
```

The first deployment creates or selects the FastAPI Cloud app and writes local linking information under the ignored `.fastapicloud/` directory. The deployment package excludes tests, enrichment scripts, reports, local environment files, and development caches through `.fastapicloudignore`. It includes all files under `app/`, including the catalog and compact serving model.

Only NumPy is needed for deployed model inference. The ALS model was trained with `implicit`, but the API evaluates the same normal equation directly from the exported item factors. This avoids depending on a system OpenMP library such as `libgomp` in the cloud runtime.

The TMDB token is not required in FastAPI Cloud because poster-path enrichment has already been completed and committed. After the Cloudflare Pages URL is known, configure the exact frontend origin as a JSON list:

```bash
uv run fastapi cloud env set FLASHBACK_ENVIRONMENT production
uv run fastapi cloud env set FLASHBACK_CORS_ORIGINS '["https://your-site.pages.dev"]'
```

Environment changes take effect on the next deployment. Until the production frontend URL is configured, API calls from `http://localhost:5173` remain the only browser origin allowed by default.

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

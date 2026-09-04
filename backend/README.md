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

The catalog and recommendation endpoints will be added in separate, tested milestones.

## Configuration

Configuration uses environment variables prefixed with `FLASHBACK_`. Copy `.env.example` to `.env` for local overrides. Local `.env` files and FastAPI Cloud deployment state are ignored by Git.

FastAPI Cloud should use `backend` as the monorepo application directory. The configured entrypoint is `app.main:app`.

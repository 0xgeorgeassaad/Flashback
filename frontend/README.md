# Flashback frontend

This directory contains the completed React, TypeScript, Tailwind, and React Router website for Flashback.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and set the Supabase project URL and publishable key. The frontend uses [https://flashback.fastapicloud.dev](https://flashback.fastapicloud.dev) by default. To use a locally running backend, set `VITE_API_URL=http://localhost:8000`.

## Validate changes

```bash
npm run lint
npm test
npm run build
```

The test suite covers authenticated API requests, catalog filtering and pagination, taste selection synchronization, and account library persistence.

## Feature ownership

| Contributor | Feature area |
|---|---|
| 1 | App shell, design system, Welcome, and shared UI |
| 2 | Search, filters, sorting, view state, and pagination |
| 3 | Movie cards, catalog layouts, posters, and details |
| 4 | Shared selection state, persistence, and Taste Builder |
| 5 | Recommendation API request states and Results |
| 6 | Saved movies, My List, and recommendation history |

See the [root README](../README.md) for the deployed website, complete route map, contributor checklist, and project architecture.

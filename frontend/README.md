# Flashback frontend

This directory contains the completed React, TypeScript, Tailwind, and React Router website for Flashback.

## Run locally

```bash
npm install
npm run dev
```

The frontend uses [https://flashback.fastapicloud.dev](https://flashback.fastapicloud.dev) by default. To use a locally running backend, set `VITE_API_URL=http://localhost:8000` in a local `.env` file.

## Validate changes

```bash
npm run lint
npm test
npm run build
```

The test suite covers catalog and recommendation API failures, catalog filtering and pagination, taste selection persistence, and library storage recovery.

## Feature ownership

| Contributor | Feature area |
|---|---|
| 1 | App shell, design system, Welcome, and shared UI |
| 2 | Search, filters, sorting, view state, and pagination |
| 3 | Movie cards, catalog layouts, posters, and details |
| 4 | Shared selection state, persistence, and Taste Builder |
| 5 | Recommendation API request states and Results |
| 6 | Saved movies, My List, and local recommendation history |

See the [root README](../README.md) for the deployed website, complete route map, contributor checklist, and project architecture.

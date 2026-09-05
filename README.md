# Flashback

## Live deployments

[![Frontend status](https://img.shields.io/website?url=https%3A%2F%2Fflashback-b8q.pages.dev%2F&label=frontend&up_message=online&down_message=offline)](https://flashback-b8q.pages.dev/)
[![Backend status](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fflashback.fastapicloud.dev%2Fhealth&query=%24.status&label=backend&color=brightgreen)](https://flashback.fastapicloud.dev/health)
[![Backend deployment](https://github.com/0xgeorgeassaad/Flashback/actions/workflows/deploy-backend.yml/badge.svg?branch=main)](https://github.com/0xgeorgeassaad/Flashback/actions/workflows/deploy-backend.yml)

- Frontend scaffold: [https://flashback-b8q.pages.dev/](https://flashback-b8q.pages.dev/)
- FastAPI backend: [https://flashback.fastapicloud.dev/](https://flashback.fastapicloud.dev/)
- API documentation: [https://flashback.fastapicloud.dev/docs](https://flashback.fastapicloud.dev/docs)

> The frontend redeploys automatically after changes are reviewed, merged into `main`, and pushed to the canonical repository.

Flashback is an anonymous movie-recommendation experience. A user discovers movies, builds a taste reel from at least five favorites, receives five recommendations from a ready ALS model, and may save interesting results locally in the browser.

The backend and model are ready and are not part of the project work. The six contributors own the complete React frontend: architecture, components, state, API integration, responsive Tailwind styling, accessibility, and frontend testing.

## Project boundaries

```text
Project/
├── frontend/     Contributor-owned React application → Cloudflare Pages
├── backend/      Ready FastAPI service, outside the project scope
└── model/        Ready ALS model and artifacts, outside the project scope
```

The provided backend contract is:

| Endpoint | Purpose |
|---|---|
| `GET /health` | Report service availability |
| `GET /movies` | Return the movie catalog and poster metadata |
| `GET /movies/search` | Optional server-side title search |
| `POST /recommend` | Accept selected movies and return five recommendations |

The frontend should not require authentication, a database, model training, or direct TMDB API calls. Saved movies, drafts, and recommendation history must use `localStorage`.

## User journey and routes

```text
Welcome /
   |
   v
Discover /discover -----> Movie details /movies/:movieId
   |
   v
Taste Builder /taste
   |
   v
POST /recommend
   |
   v
Results /results --------> My List /my-list
```

| Route | Primary job | Owner |
|---|---|---|
| `/` | Explain the product and start/resume a taste reel | Contributor 1 |
| `/discover` | Search, filter, sort, and browse the catalog | Contributors 2 and 3 |
| `/movies/:movieId` | Inspect one movie and manage its selected state | Contributor 3 |
| `/taste` | Review selections and request recommendations | Contributor 4 |
| `/results` | Present and explain the five results | Contributor 5 |
| `/my-list` | Manage saved movies and local recommendation history | Contributor 6 |

## Run the frontend

Node.js 20 or newer is required.

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Useful commands:

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite development mode |
| `npm run build` | Type-check and build production assets |
| `npm run lint` | Run the configured linter |
| `npm run preview` | Preview the production build |

The frontend uses the deployed FastAPI service by default:

```env
VITE_API_URL=https://flashback.fastapicloud.dev
```

The variable is optional because the deployed URL is also the API client's fallback. Set it to `http://localhost:8000` only when running the backend locally. Poster images are built from `posterPath` by `src/lib/posters.ts`; no TMDB API key is required.

### Test the frontend with the deployed backend

The catalog connection can be tested before any feature TODO is complete:

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). A successful connection changes the footer from `Catalog: loading` to `13680 titles in this catalog`. This verifies the frontend build, live API URL, browser CORS permission, JSON response shape, catalog provider, and rendered React state without completing the discovery or recommendation interfaces.

The recommendation endpoint can be tested independently through `/docs`, Postman, or `curl` until Contributor 5 completes the frontend request flow. This keeps the assessed TODO intact while allowing the backend contract to be verified.

### Automatic FastAPI Cloud deployment

The workflow in `.github/workflows/deploy-backend.yml` runs whenever a commit on `main` changes `backend/` or the workflow itself. It installs the locked uv environment, runs Ruff, runs the backend test suite, and deploys only after both checks pass. It can also be started manually from the GitHub Actions page.

After creating the GitHub repository and adding it as `origin`, configure the deployment credentials before the first push:

```bash
cd backend
uv run fastapi cloud setup-ci --secrets-only
```

The command creates a dedicated FastAPI Cloud deploy token and stores these GitHub Actions repository secrets:

- `FASTAPI_CLOUD_TOKEN`
- `FASTAPI_CLOUD_APP_ID`

The local FastAPI Cloud login token is never used by GitHub Actions. The workflow receives only the dedicated deploy token through GitHub's encrypted secrets. Do not enable both this workflow and FastAPI Cloud's direct GitHub deployment integration, because that would create duplicate backend deployments.

## Required contributor Git workflow

This project uses a fork-and-pull-request workflow. Contributors do not receive write access to the canonical repository. Every change must be reviewed in a pull request before it can enter `main` and reach the deployed application.

Git remote names have specific meanings in this workflow:

- `origin` is the contributor's personal GitHub fork.
- `upstream` is the canonical repository owned by the project maintainer.

Replace `ORIGINAL-OWNER`, `YOUR-USERNAME`, and `REPOSITORY` in the commands below with the real GitHub values.

1. Fork the canonical repository.

   Open the canonical repository on GitHub, select **Fork**, choose your personal GitHub account, and create the fork. Do not ask for collaborator access to the canonical repository.

2. Clone your personal fork.

   ```bash
   git clone https://github.com/YOUR-USERNAME/REPOSITORY.git
   cd REPOSITORY
   ```

   Cloning your fork automatically creates the `origin` remote.

3. Add the canonical repository as `upstream`.

   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/REPOSITORY.git
   git remote -v
   ```

   Verify that `origin` points to your fork and `upstream` points to the canonical repository. Never push directly to `upstream`.

4. Synchronize `main` before starting any task.

   ```bash
   git switch main
   git fetch upstream
   git merge --ff-only upstream/main
   git push origin main
   ```

   Do not make feature commits directly on `main`. If the fast-forward merge fails, stop and ask for help rather than forcing or resetting the branch.

5. Create a new branch from the synchronized `main` branch.

   ```bash
   git switch -c feature/short-description
   ```

   Use a focused name such as `feature/movie-search`, `feature/taste-tray`, `fix/poster-fallback`, or `test/catalog-filters`. Use a new branch for every task and keep the branch limited to one responsibility.

6. Implement only the assigned work.

   Follow the ownership boundaries and shared contracts in this README. Coordinate before changing another contributor's owned files. Never commit `.env`, credentials, tokens, `node_modules`, generated build output, or unrelated files.

7. Review and test the work locally.

   ```bash
   cd frontend
   npm install
   npm run lint
   npm run build
   cd ..
   git status
   git diff
   ```

   Confirm that the application works at relevant screen sizes and that `git status` lists only intentional changes.

8. Stage and commit the relevant files.

   ```bash
   git add frontend/path/to/changed-file
   git commit -m "Add movie search controls"
   ```

   Add the specific files that belong to the task. Use a short, clear commit message that describes the completed change. Repeat this step when the task needs more than one logical commit.

9. Push the feature branch to your fork.

   ```bash
   git push -u origin feature/short-description
   ```

   Push only to the branch on your personal fork. Do not push feature work to your fork's `main` branch.

10. Open a pull request against the canonical repository.

    On GitHub, select **Compare & pull request** and verify all four values before submitting:

    - Base repository: the canonical `ORIGINAL-OWNER/REPOSITORY`
    - Base branch: `main`
    - Head repository: `YOUR-USERNAME/REPOSITORY`
    - Compare branch: your feature branch

    Give the pull request a clear title. In its description, summarize the change, list the commands used to test it, mention any unfinished detail, and include screenshots for visible interface work. Review the **Files changed** tab and remove unrelated changes before requesting review.

11. Respond to pull request review feedback.

    Keep using the same local feature branch. Make the requested changes, test them, commit them, and push again:

    ```bash
    git switch feature/short-description
    git add frontend/path/to/changed-file
    git commit -m "Address movie search review"
    git push
    ```

    The existing pull request updates automatically. Do not close it and create a replacement pull request for normal review changes. Resolve review conversations only after the requested issue has been addressed.

12. Bring an open feature branch up to date when requested.

    If `upstream/main` changes while the pull request is open, update the feature branch before continuing:

    ```bash
    git switch feature/short-description
    git fetch upstream
    git rebase upstream/main
    git push --force-with-lease origin feature/short-description
    ```

    Use `--force-with-lease` only after rebasing your own feature branch. Never use plain `--force`, and never force-push `main`. If a rebase reports conflicts, resolve them carefully and rerun the frontend checks before pushing.

13. Wait for the maintainer to review and merge the pull request.

    Contributors must not merge their own pull requests. A pull request is complete only after the maintainer has reviewed it, the required checks have passed, and it has been merged into the canonical `main` branch. Production deployment occurs from the canonical `main`, not from a contributor's fork.

14. Synchronize both local and forked `main` after the pull request is merged.

    ```bash
    git switch main
    git fetch upstream
    git merge --ff-only upstream/main
    git push origin main
    ```

    The local `main`, personal fork's `main`, and canonical `main` should now point to the same accepted work.

15. Start the next task from the newly synchronized `main`.

    ```bash
    git switch -c feature/next-short-description
    ```

    Never reuse an old feature branch for a new task. The complete cycle is: sync `main`, create a branch, implement, test, push to the fork, open a pull request, address review, wait for the merge, and sync again.

GitHub's official documentation provides additional guidance on [working with forks](https://docs.github.com/en/pull-requests/how-tos/work-with-forks) and [contributing through a fork](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project).

## Frontend structure

```text
frontend/src/
├── App.tsx                         Route definitions only
├── main.tsx                        Router and global providers
├── index.css                       Tailwind import and design tokens
├── api/
│   └── client.ts                   Catalog and recommendation requests
├── components/
│   ├── home/
│   │   └── HowItWorks.tsx
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   └── ui/
│       ├── PageIntro.tsx
│       └── TodoPanel.tsx
├── features/
│   ├── catalog/
│   │   ├── components/
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── MovieCard.tsx
│   │   │   ├── MovieDetails.tsx
│   │   │   ├── MovieGrid.tsx
│   │   │   └── MovieSearch.tsx
│   │   └── hooks/useMovieFilters.ts
│   ├── taste/components/
│   │   ├── SelectedMovieList.tsx
│   │   ├── SelectionProgress.tsx
│   │   ├── SelectionTray.tsx
│   │   └── TasteSummary.tsx
│   ├── recommendations/
│   │   ├── components/
│   │   │   ├── GenreComparison.tsx
│   │   │   ├── RecommendationGrid.tsx
│   │   │   └── RecommendationHero.tsx
│   │   └── useRecommendations.ts
│   └── library/
│       ├── components/
│       │   ├── LibraryToolbar.tsx
│       │   ├── RecommendationHistory.tsx
│       │   └── SavedMovies.tsx
│       └── useLibrary.ts
├── hooks/
│   └── useLocalStorage.ts
├── pages/
│   ├── DiscoverPage.tsx
│   ├── HomePage.tsx
│   ├── MovieDetailsPage.tsx
│   ├── MyListPage.tsx
│   ├── NotFoundPage.tsx
│   ├── ResultsPage.tsx
│   └── TasteBuilderPage.tsx
└── state/
    ├── CatalogContext.tsx
    └── TasteContext.tsx
```

The ownership labels establish primary responsibility, not isolation. Contributors must agree on props and shared types before depending on one another's components.

## Shared design brief

The visual direction is a **late-night video archive**, not a generic dashboard.

- `booth`: midnight-blue page background
- `reel`: raised archive/card surface
- `screen`: projector-screen primary text
- `haze`: secondary text
- `marquee`: primary action and focus accent
- `ticket`: warnings and secondary accent
- Display type: Archivo Black
- Body type: IBM Plex Sans
- Utility/data type: IBM Plex Mono
- Signature element: the persistent selected-movie tray should resemble a restrained film strip

Contributor 1 maintains the tokens in `src/index.css`. Every contributor supplies the styling for their own pages and components. Do not introduce a prebuilt component library that removes the Tailwind/design work from the assignment.

Every feature must include:

- Mobile, tablet, and desktop layouts
- Hover, focus, selected, disabled, and loading states where relevant
- Keyboard access and visible focus
- Semantic HTML and useful accessible names
- Empty, error, and missing-image states
- Reduced-motion behavior for nonessential animation

## Work division and TODOs

### Contributor 1: Foundation, design system, and Welcome

Owned areas: `components/layout`, `components/home`, shared `components/ui`, `HomePage`, `NotFoundPage`, and `index.css`.

- [ ] Refine the shared color, typography, spacing, border, shadow, and motion tokens.
- [ ] Build reusable `Button`, `IconButton`, `Chip`, `Dialog`, `Toast`, and `Skeleton` primitives.
- [ ] Complete the responsive navigation and accessible mobile menu.
- [ ] Complete the footer, including meaningful catalog/service status.
- [ ] Build the poster-marquee/contact-sheet hero from provided catalog data.
- [ ] Finish the “How it works” section and genre entry shortcuts.
- [ ] Show “Continue your reel” only when a saved draft exists.
- [ ] Ensure app-shell focus order and skip navigation are accessible.
- [ ] Complete the 404 page and unknown-route focus behavior.
- [ ] Document shared component props so the other five contributors can reuse them.

Acceptance criteria:

- [ ] Shared primitives visually and behaviorally match across every route.
- [ ] Navigation works at all breakpoints and without a mouse.
- [ ] The landing page clearly explains and begins the recommendation journey.

### Contributor 2: Discovery, filtering, and catalog controls

Owned areas: `MovieSearch`, `FilterPanel`, `useMovieFilters`, and the control portion of `DiscoverPage`.

- [ ] Implement controlled, case-insensitive local title search.
- [ ] Highlight the matching text without injecting unsafe HTML.
- [ ] Add multi-select genre filters and active-filter chips.
- [ ] Parse years from titles and provide decade filters.
- [ ] Implement title and year sorting without mutating catalog state.
- [ ] Implement grid/list view controls.
- [ ] Synchronize filters with URL search parameters.
- [ ] Add clear-one and clear-all filter actions.
- [ ] Implement client-side pagination or “Load more” using `CATALOG_PAGE_SIZE`.
- [ ] Design loading, zero-results, and reset-filter states.
- [ ] Coordinate the filtered result contract with Contributor 3.

Acceptance criteria:

- [ ] Combined filters, sorting, and pagination produce deterministic results.
- [ ] Refreshing or sharing a Discover URL restores its filter state.
- [ ] All controls remain usable on narrow mobile screens and by keyboard.

### Contributor 3: Movie presentation, grid, and details

Owned areas: `MovieCard`, `MovieGrid`, `MovieDetails`, and `MovieDetailsPage`.

- [ ] Build poster-first cards for grid and list modes.
- [ ] Use `posterUrl()` and handle null URLs plus image load failures.
- [ ] Show title, parsed year, genres, and selected/unselected state.
- [ ] Add accessible Select/Remove and Details interactions.
- [ ] Avoid nested interactive controls and ambiguous card click behavior.
- [ ] Build responsive catalog layouts with stable poster aspect ratios.
- [ ] Add catalog loading skeletons and a useful catalog failure/retry state.
- [ ] Render the filtered/paginated result supplied by Contributor 2.
- [ ] Resolve `movieId` on the details route and handle unknown IDs.
- [ ] Build details actions that share selection state with Contributor 4.
- [ ] Calculate a simple related-movies section using shared genres.

Acceptance criteria:

- [ ] A card behaves consistently in Discover, Results, Details, and My List.
- [ ] Missing/broken posters never break layout.
- [ ] Detail URLs work directly after a browser refresh.

### Contributor 4: Taste Builder and selection state

Owned areas: `TasteContext`, `useLocalStorage` for draft selection, all `features/taste` components, and `TasteBuilderPage`.

- [ ] Implement add/remove/toggle selection without duplicates.
- [ ] Hydrate and persist the current selection using `STORAGE_KEYS.tasteDraft`.
- [ ] Recover safely from malformed or stale local data.
- [ ] Complete the film-strip selection tray and mobile collapsed state.
- [ ] Implement selected poster thumbnails and individual remove actions.
- [ ] Build the progress display for the five-movie minimum.
- [ ] Build the full selected-movie review grid.
- [ ] Add removal undo and sensible focus restoration.
- [ ] Calculate a factual genre-distribution taste summary.
- [ ] Disable recommendation submission until at least five movies are selected.
- [ ] Integrate Contributor 5's recommendation request and navigate on success.
- [ ] Preserve selections after failed requests so users can retry.

Acceptance criteria:

- [ ] Selection state remains consistent across Discover, Details, Taste Builder, and refreshes.
- [ ] The request payload contains unique `{ movieId, rating: 5 }` entries.
- [ ] Validation explains how the user can proceed rather than only reporting an error.

### Contributor 5: Recommendation request and Results

Owned areas: the recommendation portion of `api/client.ts`, `features/recommendations`, and `ResultsPage`.

- [ ] Finish the real `POST /recommend` request and non-OK response handling.
- [ ] Implement recommendation loading, success, failure, retry, and reset state.
- [ ] Design a skeleton that preserves the final results layout.
- [ ] Feature the first result as the top pick and rank the remaining four.
- [ ] Reuse Contributor 3's cards rather than creating incompatible result cards.
- [ ] Display scores without calling them probabilities or percentages.
- [ ] Calculate factual genre overlap between selections and recommendations.
- [ ] Provide Refine and Start another reel actions with clearly different behavior.
- [ ] Connect result Save actions and completed sessions to Contributor 6's library API.

Acceptance criteria:

- [ ] Exactly five normal recommendations render from the real API.
- [ ] Failed requests are retryable and do not erase the taste reel.
- [ ] Results pass saved movies and completed sessions through the agreed library contract.

### Contributor 6: Saved movies and local history

Owned areas: `useLocalStorage` for library data, `features/library`, and `MyListPage`.

- [ ] Save/remove movies locally and mark them watched/unwatched.
- [ ] Persist completed recommendation sessions locally with timestamps.
- [ ] Implement My List search, filter, sorting, empty states, and removal undo.
- [ ] Implement session reopen/remove behavior and stale-entry handling.
- [ ] Clearly state that saved content exists only in the current browser.
- [ ] Define the library contract used by Contributor 5's result actions.
- [ ] Recover safely from malformed local data without breaking the page.

Acceptance criteria:

- [ ] Saved movies and history survive refreshes without requiring an account.
- [ ] Watched status, removal, and session reopening remain consistent after refresh.
- [ ] Clearing or corrupting local data leads to an intentional recovery state.

## Shared integration TODOs

These items require the whole team and are not owned by only one contributor.

- [ ] Agree on component props, context actions, and shared TypeScript types before feature integration.
- [ ] Use feature branches and keep `App.tsx` limited to routes.
- [ ] Add component/unit tests for filtering, selection, persistence, and request failures.
- [ ] Test all routes at mobile, tablet, and desktop widths.
- [ ] Test keyboard-only navigation and screen-reader labels.
- [ ] Test null posters, broken poster URLs, empty arrays, malformed storage, and offline API behavior.
- [ ] Run `npm run lint` and `npm run build` before every integration merge.
- [ ] Confirm Cloudflare Pages serves direct route refreshes through `public/_redirects`.
- [ ] Complete an end-to-end recommendation test with the deployed FastAPI service.
- [ ] Remove all visible scaffold TODO panels before final submission.

## Definition of done

The project is complete when an anonymous user can:

1. Understand the product on the Welcome page.
2. Search, filter, sort, and paginate the supplied movie catalog.
3. Open a movie detail URL and add or remove that movie.
4. Select at least five unique movies and retain that draft after refresh.
5. Review their taste reel and request recommendations.
6. See a resilient loading state followed by five recommendation results.
7. Understand factual genre overlap without misleading model explanations.
8. Save movies, mark them watched, and revisit local recommendation sessions.
9. Complete the entire journey on mobile and with keyboard navigation.
10. Use the deployed Cloudflare Pages frontend with the supplied FastAPI backend.

## Explicitly out of scope

- Authentication, accounts, passwords, or server-side user profiles
- A frontend-owned database
- Social feeds, comments, or public reviews
- Payments or subscriptions
- An administration dashboard
- Calling the TMDB API for each poster
- Model training, model comparison, or group recommendation algorithms
- Claiming that genre overlap explains the internal ALS recommendation score

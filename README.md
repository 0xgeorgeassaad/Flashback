# Flashback

Website URL: [https://flashback-b8q.pages.dev/](https://flashback-b8q.pages.dev/)

> The website redeploys automatically after changes are reviewed, merged into `main`, and pushed to the canonical repository.

## Live deployments

[![Frontend status](https://img.shields.io/website?url=https%3A%2F%2Fflashback-b8q.pages.dev%2F&label=frontend&up_message=online&down_message=offline)](https://flashback-b8q.pages.dev/)
[![Backend status](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fflashback.fastapicloud.dev%2Fhealth&query=%24.status&label=backend&color=brightgreen)](https://flashback.fastapicloud.dev/health)
[![Backend deployment](https://github.com/0xgeorgeassaad/Flashback/actions/workflows/deploy-backend.yml/badge.svg?branch=main)](https://github.com/0xgeorgeassaad/Flashback/actions/workflows/deploy-backend.yml)

- FastAPI backend: [https://flashback.fastapicloud.dev/](https://flashback.fastapicloud.dev/)
- API documentation: [https://flashback.fastapicloud.dev/docs](https://flashback.fastapicloud.dev/docs)

Flashback is an account-based movie recommendation experience. A user creates an account, discovers movies, builds a taste reel from at least five favorites, receives five recommendations from a ready ALS model, and can revisit saved movies and recommendation history from any device.

The recommendation model is already trained. The React frontend and FastAPI backend now use Supabase for authentication and account-scoped persistence.

## Project boundaries

```text
Project/
├── frontend/     React application deployed to Cloudflare Pages
├── backend/      FastAPI application deployed to FastAPI Cloud
├── model/        Ready ALS model and training artifacts
└── supabase/     SQL schema and row-level security policies
```

The provided backend contract is:

| Endpoint | Purpose |
|---|---|
| `GET /health` | Report service availability, public |
| `GET /movies` | Return the movie catalog and poster metadata, authenticated |
| `GET /movies/search` | Search catalog titles, authenticated |
| `POST /recommend` | Accept selected movies and return five recommendations, authenticated |
| `GET/PUT /me/selections` | Load or replace the signed-in user's taste reel |
| `GET/POST/PATCH/DELETE /me/saved-movies` | Manage the signed-in user's saved movies |
| `GET/POST/DELETE /me/recommendation-sessions` | Manage recommendation history |
| `DELETE /me/library` | Clear saved movies and recommendation history |

Supabase Auth creates and refreshes the browser session. The frontend sends the Supabase access token to FastAPI on every application request. FastAPI verifies the token and uses it for Supabase Data API requests, where row-level security limits every user to their own records. The frontend never receives a secret or service-role key. Direct TMDB API requests are still unnecessary because poster paths are already included in the catalog.

## User journey and routes

```text
Sign in /auth
   |
   v
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
| `/auth` | Create an account or sign in | Shared integration |
| `/` | Explain the product and start/resume a taste reel | Contributor 1 |
| `/discover` | Search, filter, sort, and browse the catalog | Contributors 2 and 3 |
| `/movies/:movieId` | Inspect one movie and manage its selected state | Contributor 3 |
| `/taste` | Review selections and request recommendations | Contributor 4 |
| `/results` | Present and explain the five results | Contributor 5 |
| `/my-list` | Manage saved movies and account recommendation history | Contributor 6 |

## Run the frontend

Node.js 22 or newer is required.

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
| `npm test` | Run the frontend unit and component tests |
| `npm run preview` | Preview the production build |

The frontend uses the deployed FastAPI service by default:

```env
VITE_API_URL=https://flashback.fastapicloud.dev
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

`VITE_API_URL` is optional because the deployed URL is also the API client's fallback. The two Supabase variables are required. Set `VITE_API_URL` to `http://localhost:8000` only when running the backend locally. Poster images are built from `posterPath` by `src/lib/posters.ts`; no TMDB API key is required.

### One-time Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**, paste `supabase/schema.sql`, and run it once. This creates the account tables and row-level security policies.
3. In **Authentication > Providers**, keep Email enabled.
4. In **Authentication > URL Configuration**, set the production Site URL to `https://flashback-b8q.pages.dev` and add `http://localhost:5173/**` plus `https://flashback-b8q.pages.dev/**` as allowed redirect URLs.
5. Open the project's **Connect** dialog or API settings and copy only the Project URL and Publishable key. Never use the Secret key or legacy `service_role` key in this application.
6. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to both the Cloudflare Pages production and preview environments.
7. Add the same URL and publishable key to FastAPI Cloud as `FLASHBACK_SUPABASE_URL` and `FLASHBACK_SUPABASE_PUBLISHABLE_KEY`.

For Cloudflare preview deployments, configure `FLASHBACK_CORS_ORIGIN_REGEX` in FastAPI Cloud as `^https://([a-z0-9-]+\.)?flashback-b8q\.pages\.dev$`. Keep the exact production URL and `http://localhost:5173` in `FLASHBACK_CORS_ORIGINS`.

Local `.env` files are ignored by Git. The publishable key is intentionally safe to expose in frontend code; security comes from the user's access token and the database row-level security policies.

### Test the website with the deployed backend

Run the completed frontend locally against the deployed API:

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), create an account or sign in, and load Discover. A successful connection changes the footer from `Catalog loading` to `13,680 titles in this catalog`. This verifies authentication, the live API URL, browser CORS permission, JSON response shape, catalog provider, and rendered React state.

The recommendation endpoint can also be tested independently through `/docs`, Postman, or `curl` when verifying the backend contract.

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
│   └── client.ts                   Authenticated application requests
├── components/
│   ├── auth/
│   │   ├── AuthenticatedProviders.tsx
│   │   └── RequireAuth.tsx
│   ├── home/
│   │   └── HowItWorks.tsx
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Chip.tsx
│       ├── Dialog.tsx
│       ├── IconButton.tsx
│       ├── PageIntro.tsx
│       ├── Skeleton.tsx
│       └── Toast.tsx
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
│       ├── LibraryContext.tsx
│       ├── components/
│       │   ├── LibraryToolbar.tsx
│       │   ├── RecommendationHistory.tsx
│       │   └── SavedMovies.tsx
│       └── useLibrary.ts
├── lib/
│   ├── guards.ts
│   ├── posters.ts
│   └── supabase.ts
├── pages/
│   ├── AuthPage.tsx
│   ├── DiscoverPage.tsx
│   ├── HomePage.tsx
│   ├── MovieDetailsPage.tsx
│   ├── MyListPage.tsx
│   ├── NotFoundPage.tsx
│   ├── ResultsPage.tsx
│   └── TasteBuilderPage.tsx
└── state/
    ├── AuthContext.tsx
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

- [x] Refine the shared color, typography, spacing, border, shadow, and motion tokens.
- [x] Build reusable `Button`, `IconButton`, `Chip`, `Dialog`, `Toast`, and `Skeleton` primitives.
- [x] Complete the responsive navigation and accessible mobile menu.
- [x] Complete the footer, including meaningful catalog/service status.
- [x] Build the poster-marquee/contact-sheet hero from provided catalog data.
- [x] Finish the “How it works” section and genre entry shortcuts.
- [x] Show “Continue your reel” only when a saved draft exists.
- [x] Ensure app-shell focus order and skip navigation are accessible.
- [x] Complete the 404 page and unknown-route focus behavior.
- [x] Document shared component props so the other five contributors can reuse them.

Acceptance criteria:

- [x] Shared primitives visually and behaviorally match across every route.
- [x] Navigation works at all breakpoints and without a mouse.
- [x] The landing page clearly explains and begins the recommendation journey.

### Contributor 2: Discovery, filtering, and catalog controls

Owned areas: `MovieSearch`, `FilterPanel`, `useMovieFilters`, and the control portion of `DiscoverPage`.

- [x] Implement controlled, case-insensitive local title search.
- [x] Highlight the matching text without injecting unsafe HTML.
- [x] Add multi-select genre filters and active-filter chips.
- [x] Parse years from titles and provide decade filters.
- [x] Implement title and year sorting without mutating catalog state.
- [x] Implement grid/list view controls.
- [x] Synchronize filters with URL search parameters.
- [x] Add clear-one and clear-all filter actions.
- [x] Implement client-side pagination or “Load more” using `CATALOG_PAGE_SIZE`.
- [x] Design loading, zero-results, and reset-filter states.
- [x] Coordinate the filtered result contract with Contributor 3.

Acceptance criteria:

- [x] Combined filters, sorting, and pagination produce deterministic results.
- [x] Refreshing or sharing a Discover URL restores its filter state.
- [x] All controls remain usable on narrow mobile screens and by keyboard.

### Contributor 3: Movie presentation, grid, and details

Owned areas: `MovieCard`, `MovieGrid`, `MovieDetails`, and `MovieDetailsPage`.

- [x] Build poster-first cards for grid and list modes.
- [x] Use `posterUrl()` and handle null URLs plus image load failures.
- [x] Show title, parsed year, genres, and selected/unselected state.
- [x] Add accessible Select/Remove and Details interactions.
- [x] Avoid nested interactive controls and ambiguous card click behavior.
- [x] Build responsive catalog layouts with stable poster aspect ratios.
- [x] Add catalog loading skeletons and a useful catalog failure/retry state.
- [x] Render the filtered/paginated result supplied by Contributor 2.
- [x] Resolve `movieId` on the details route and handle unknown IDs.
- [x] Build details actions that share selection state with Contributor 4.
- [x] Calculate a simple related-movies section using shared genres.

Acceptance criteria:

- [x] A card behaves consistently in Discover, Results, Details, and My List.
- [x] Missing/broken posters never break layout.
- [x] Detail URLs work directly after a browser refresh.

### Contributor 4: Taste Builder and selection state

Owned areas: `TasteContext`, all `features/taste` components, and `TasteBuilderPage`.

- [x] Implement add/remove/toggle selection without duplicates.
- [x] Hydrate and persist the current selection through the authenticated FastAPI account API.
- [x] Report synchronization failures without discarding the current in-memory selection.
- [x] Complete the film-strip selection tray and mobile collapsed state.
- [x] Implement selected poster thumbnails and individual remove actions.
- [x] Build the progress display for the five-movie minimum.
- [x] Build the full selected-movie review grid.
- [x] Add removal undo and sensible focus restoration.
- [x] Calculate a factual genre-distribution taste summary.
- [x] Disable recommendation submission until at least five movies are selected.
- [x] Integrate Contributor 5's recommendation request and navigate on success.
- [x] Preserve selections after failed requests so users can retry.

Acceptance criteria:

- [x] Selection state remains consistent across Discover, Details, Taste Builder, and refreshes.
- [x] The request payload contains unique `{ movieId, rating: 5 }` entries.
- [x] Validation explains how the user can proceed rather than only reporting an error.

### Contributor 5: Recommendation request and Results

Owned areas: the recommendation portion of `api/client.ts`, `features/recommendations`, and `ResultsPage`.

- [x] Finish the real `POST /recommend` request and non-OK response handling.
- [x] Implement recommendation loading, success, failure, retry, and reset state.
- [x] Design a skeleton that preserves the final results layout.
- [x] Feature the first result as the top pick and rank the remaining four.
- [x] Reuse Contributor 3's cards rather than creating incompatible result cards.
- [x] Display scores without calling them probabilities or percentages.
- [x] Calculate factual genre overlap between selections and recommendations.
- [x] Provide Refine and Start another reel actions with clearly different behavior.
- [x] Connect result Save actions and completed sessions to Contributor 6's library API.

Acceptance criteria:

- [x] Exactly five normal recommendations render from the real API.
- [x] Failed requests are retryable and do not erase the taste reel.
- [x] Results pass saved movies and completed sessions through the agreed library contract.

### Contributor 6: Saved movies and recommendation history

Owned areas: `features/library` and `MyListPage`.

- [x] Save/remove account movies and mark them watched/unwatched.
- [x] Persist completed recommendation sessions to the account with timestamps.
- [x] Implement My List search, filter, sorting, empty states, and removal undo.
- [x] Implement session reopen/remove behavior and stale-entry handling.
- [x] Clearly state that saved content synchronizes across signed-in devices.
- [x] Define the library contract used by Contributor 5's result actions.
- [x] Show loading, failure, retry, and optimistic update states for account data.

Acceptance criteria:

- [x] Saved movies and history survive refreshes and follow the signed-in account.
- [x] Watched status, removal, and session reopening remain consistent after refresh.
- [x] Failed account updates roll back or show an intentional recovery state.

## Shared integration TODOs

These items require the whole team and are not owned by only one contributor.

- [x] Agree on component props, context actions, and shared TypeScript types before feature integration.
- [x] Use feature branches and keep `App.tsx` limited to routes.
- [x] Add component/unit tests for filtering, selection, account persistence, and request failures.
- [x] Test all routes at mobile, tablet, and desktop widths.
- [x] Test keyboard-only navigation and screen-reader labels.
- [x] Test null posters, broken poster URLs, empty arrays, account synchronization, and offline API behavior.
- [x] Run `npm run lint` and `npm run build` before every integration merge.
- [x] Confirm Cloudflare Pages serves direct route refreshes through `public/_redirects`.
- [x] Complete an end-to-end recommendation test with the deployed FastAPI service.
- [x] Remove all visible scaffold TODO panels before final submission.

## Definition of done

The project is complete when an authenticated user can:

1. Understand the product on the Welcome page.
2. Search, filter, sort, and paginate the supplied movie catalog.
3. Open a movie detail URL and add or remove that movie.
4. Select at least five unique movies and retain that draft across signed-in devices.
5. Review their taste reel and request recommendations.
6. See a resilient loading state followed by five recommendation results.
7. Understand factual genre overlap without misleading model explanations.
8. Save movies, mark them watched, and revisit account recommendation sessions.
9. Complete the entire journey on mobile and with keyboard navigation.
10. Use the deployed Cloudflare Pages frontend with the supplied FastAPI backend.

## Explicitly out of scope

- Custom password storage or a custom token issuer
- Direct browser access to application database tables
- Social feeds, comments, or public reviews
- Payments or subscriptions
- An administration dashboard
- Calling the TMDB API for each poster
- Model training, model comparison, or group recommendation algorithms
- Claiming that genre overlap explains the internal ALS recommendation score

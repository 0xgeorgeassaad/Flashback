import { useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { PageIntro } from '../components/ui/PageIntro'
import { useLibrary } from '../features/library/LibraryContext'
import { GenreComparison } from '../features/recommendations/components/GenreComparison'
import {
  RecommendationGrid,
  RecommendationGridSkeleton,
} from '../features/recommendations/components/RecommendationGrid'
import {
  RecommendationHero,
  RecommendationHeroSkeleton,
} from '../features/recommendations/components/RecommendationHero'
import { useRecommendations } from '../features/recommendations/useRecommendations'
import { useCatalog } from '../state/CatalogContext'
import { useTaste } from '../state/TasteContext'
import type { Recommendation, RecommendationSession } from '../types'

export function ResultsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const library = useLibrary()
  const catalog = useCatalog()
  const taste = useTaste()
  const requestedSessionId = searchParams.get('session')
  const storedSession = requestedSessionId ? library.findSession(requestedSessionId) : undefined
  const saveSession = library.saveSession
  const generatedSessionId = useRef<string | null>(null)
  const {
    recommendations: requestedRecommendations,
    status: requestStatus,
    error: requestError,
    requestRecommendations,
    resetRecommendations,
  } = useRecommendations(taste.recommendationPayload)

  useEffect(() => {
    if (
      !requestedSessionId &&
      taste.isValidSelection &&
      requestStatus === 'idle'
    ) {
      void requestRecommendations()
    }
  }, [
    requestRecommendations,
    requestStatus,
    requestedSessionId,
    taste.isValidSelection,
  ])

  useEffect(() => {
    if (
      requestedSessionId ||
      requestStatus !== 'success' ||
      requestedRecommendations.length !== 5
    ) {
      return
    }

    const sessionId = generatedSessionId.current ?? createSessionId()
    generatedSessionId.current = sessionId
    const session: RecommendationSession = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      selectedMovieIds: taste.selectedMovies.map((movie) => movie.movieId),
      selectedMovies: taste.selectedMovies,
      recommendations: requestedRecommendations,
    }

    saveSession(session)
    setSearchParams({ session: sessionId }, { replace: true })
  }, [
    requestedRecommendations,
    requestStatus,
    requestedSessionId,
    saveSession,
    setSearchParams,
    taste.selectedMovies,
  ])

  const recommendations = storedSession?.recommendations ?? requestedRecommendations
  const selectedMovies = useMemo(() => {
    if (!storedSession) return taste.selectedMovies
    if (storedSession.selectedMovies && storedSession.selectedMovies.length > 0) {
      return storedSession.selectedMovies
    }

    const selectedIds = new Set(storedSession.selectedMovieIds)
    return catalog.movies.filter((movie) => selectedIds.has(movie.movieId))
  }, [catalog.movies, storedSession, taste.selectedMovies])

  const missingCatalogEntries = useMemo(() => {
    if (!storedSession || catalog.status !== 'ready') return 0
    const catalogIds = new Set(catalog.movies.map((movie) => movie.movieId))
    const sessionIds = new Set([
      ...storedSession.selectedMovieIds,
      ...storedSession.recommendations.map((movie) => movie.movieId),
    ])
    return [...sessionIds].filter((movieId) => !catalogIds.has(movieId)).length
  }, [catalog.movies, catalog.status, storedSession])

  function toggleSaved(recommendation: Recommendation) {
    if (library.isSaved(recommendation.movieId)) {
      library.removeMovie(recommendation.movieId)
    } else {
      library.saveMovie(recommendation)
    }
  }

  function refineReel() {
    if (storedSession) taste.replaceSelection(selectedMovies)
    navigate('/taste')
  }

  function startAnotherReel() {
    taste.clearSelection()
    resetRecommendations()
    navigate('/discover')
  }

  if (requestedSessionId && !storedSession) {
    return (
      <ResultsMessage
        eyebrow="Saved reel unavailable"
        title="This reel is no longer in your history."
        description="It may have been removed or cleared from your account. Open My List to choose another saved reel."
      >
        <Link to="/my-list" className={secondaryLinkClasses}>
          Open My List
        </Link>
        <Link to="/taste" className={primaryLinkClasses}>
          Use my current picks
        </Link>
      </ResultsMessage>
    )
  }

  if (!requestedSessionId && !taste.isValidSelection) {
    const remaining = Math.max(0, 5 - taste.selectedMovies.length)
    return (
      <ResultsMessage
        eyebrow="Reel not ready"
        title="Choose five movies first."
        description={`Your reel needs ${remaining} more ${remaining === 1 ? 'movie' : 'movies'} before the model can prepare recommendations.`}
      >
        <Link to="/discover" className={primaryLinkClasses}>
          Find movies
        </Link>
        {taste.selectedMovies.length > 0 ? (
          <Link to="/taste" className={secondaryLinkClasses}>
            Review my picks
          </Link>
        ) : null}
      </ResultsMessage>
    )
  }

  return (
    <div className="space-y-10">
      <PageIntro
        eyebrow={requestedSessionId ? 'From your reel archive' : 'Preparing your next reel'}
        title="Five films for what comes next."
        description="The recommendation model ranked these titles from your selected movies. Scores compare this set and are not probabilities."
      />

      {requestStatus === 'loading' && !storedSession ? (
        <div role="status" aria-label="Preparing recommendations" className="space-y-10">
          <p className="font-utility text-xs uppercase tracking-[0.18em] text-marquee">
            Running your reel through the model
          </p>
          <RecommendationHeroSkeleton />
          <RecommendationGridSkeleton />
        </div>
      ) : null}

      {requestStatus === 'error' && !storedSession ? (
        <section role="alert" className="rounded-panel border border-ticket/50 bg-ticket/10 p-6 sm:p-8">
          <p className="font-utility text-xs uppercase tracking-[0.18em] text-ticket">Request interrupted</p>
          <h2 className="mt-3 font-display text-2xl text-screen">The reel could not be prepared.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-haze">{requestError}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={() => void requestRecommendations()}>
              Try again
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/taste')}>
              Refine my picks
            </Button>
          </div>
        </section>
      ) : null}

      {recommendations.length === 5 ? (
        <>
          {missingCatalogEntries > 0 ? (
            <div role="status" className="rounded-xl border border-ticket/45 bg-ticket/10 px-4 py-3 text-sm leading-6 text-haze-strong">
              {missingCatalogEntries} {missingCatalogEntries === 1 ? 'title is' : 'titles are'} no longer in the current catalog. The saved reel remains available, but some details pages may be unavailable.
            </div>
          ) : null}

          <RecommendationHero
            recommendation={recommendations[0]}
            saved={library.isSaved(recommendations[0].movieId)}
            onToggleSaved={toggleSaved}
          />
          <RecommendationGrid
            recommendations={recommendations.slice(1)}
            isSaved={library.isSaved}
            onToggleSaved={toggleSaved}
          />
          <GenreComparison selectedMovies={selectedMovies} recommendations={recommendations} />

          <section className="flex flex-col gap-4 rounded-panel border border-line bg-reel/45 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl text-screen">Where to next?</h2>
              <p className="mt-2 text-sm leading-6 text-haze">
                Refine keeps this reel together. Starting again clears your current picks but keeps saved results in My List.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={refineReel} disabled={selectedMovies.length === 0}>
                Refine this reel
              </Button>
              <Button type="button" onClick={startAnotherReel}>
                Start another reel
              </Button>
              <Link to="/my-list" className={secondaryLinkClasses}>
                Open My List
              </Link>
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}

function ResultsMessage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="archive-grid rounded-panel border border-line bg-reel/55 p-8 text-center shadow-panel sm:p-12">
      <p className="font-utility text-xs uppercase tracking-[0.18em] text-marquee">{eyebrow}</p>
      <h1 className="mx-auto mt-4 max-w-3xl font-display text-3xl leading-tight text-screen sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-haze sm:text-base">{description}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div>
    </section>
  )
}

function createSessionId() {
  return globalThis.crypto?.randomUUID?.() ?? `reel-${Date.now().toString(36)}`
}

const primaryLinkClasses =
  'inline-flex min-h-11 items-center justify-center rounded-full border border-marquee bg-marquee px-5 text-sm font-semibold text-booth transition-colors hover:border-screen hover:bg-screen'
const secondaryLinkClasses =
  'inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-reel px-5 text-sm font-semibold text-screen transition-colors hover:border-haze hover:bg-reel-raised'

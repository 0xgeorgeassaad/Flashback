import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'
import { PageIntro } from '../components/ui/PageIntro'
import { Toast } from '../components/ui/Toast'
import { useLibrary } from '../features/library/LibraryContext'
import { LibraryToolbar } from '../features/library/components/LibraryToolbar'
import { RecommendationHistory } from '../features/library/components/RecommendationHistory'
import { SavedMovies } from '../features/library/components/SavedMovies'
import { useCatalog } from '../state/CatalogContext'
import type { RecommendationSession } from '../types'

type Tab = 'saved' | 'history'

export function MyListPage() {
  const [tab, setTab] = useState<Tab>('saved')
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const savedTabRef = useRef<HTMLButtonElement>(null)
  const historyTabRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const library = useLibrary()
  const catalog = useCatalog()
  const availableMovieIds = useMemo(
    () => new Set(catalog.movies.map((movie) => movie.movieId)),
    [catalog.movies],
  )

  function reopenSession(session: RecommendationSession) {
    navigate(`/results?session=${encodeURIComponent(session.id)}`)
  }

  function resetFilters() {
    library.setQuery('')
    library.setFilter('all')
  }

  function clearSavedData() {
    library.clearLibrary()
    setClearDialogOpen(false)
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    let nextTab: Tab | null = null
    if (event.key === 'ArrowRight' || event.key === 'End') nextTab = 'history'
    if (event.key === 'ArrowLeft' || event.key === 'Home') nextTab = 'saved'
    if (!nextTab) return

    event.preventDefault()
    setTab(nextTab)
    const nextTabRef = nextTab === 'saved' ? savedTabRef : historyTabRef
    nextTabRef.current?.focus()
  }

  const hasData = library.totalSaved > 0 || library.history.length > 0

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Synced to your account"
        title="Keep the ones worth remembering."
        description="Saved movies and recommendation reels follow your account, so you can return to them from any device."
      />

      <Toast
        open={library.error !== null}
        tone="error"
        title="Your library could not be synchronized"
        description={library.error ?? ''}
        action={
          <Button type="button" size="sm" variant="secondary" onClick={library.reload}>
            Try again
          </Button>
        }
      />

      {library.loading ? (
        <div role="status" className="rounded-panel border border-line bg-reel/45 p-8 text-center text-sm text-haze">
          Loading your saved movies and recommendation history...
        </div>
      ) : null}

      <div role="tablist" aria-label="My List sections" className="flex gap-2 border-b border-line">
        <button
          ref={savedTabRef}
          role="tab"
          id="tab-saved"
          aria-selected={tab === 'saved'}
          aria-controls="panel-saved"
          tabIndex={tab === 'saved' ? 0 : -1}
          type="button"
          onClick={() => setTab('saved')}
          onKeyDown={handleTabKeyDown}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === 'saved' ? 'border-marquee text-screen' : 'border-transparent text-haze hover:text-screen'
          }`}
        >
          Saved movies ({library.totalSaved})
        </button>
        <button
          ref={historyTabRef}
          role="tab"
          id="tab-history"
          aria-selected={tab === 'history'}
          aria-controls="panel-history"
          tabIndex={tab === 'history' ? 0 : -1}
          type="button"
          onClick={() => setTab('history')}
          onKeyDown={handleTabKeyDown}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === 'history' ? 'border-marquee text-screen' : 'border-transparent text-haze hover:text-screen'
          }`}
        >
          Recommendation history ({library.history.length})
        </button>
      </div>

      {tab === 'saved' ? (
        <section id="panel-saved" role="tabpanel" aria-labelledby="tab-saved" className="space-y-5">
          <LibraryToolbar
            query={library.query}
            onQueryChange={library.setQuery}
            filter={library.filter}
            onFilterChange={library.setFilter}
            sort={library.sort}
            onSortChange={library.setSort}
            visibleCount={library.savedMovies.length}
            totalSaved={library.totalSaved}
            hasData={hasData}
            onClearData={() => setClearDialogOpen(true)}
          />
          <SavedMovies
            movies={library.savedMovies}
            totalSaved={library.totalSaved}
            onToggleWatched={library.toggleWatched}
            onRemove={library.removeMovie}
            onRestore={library.restoreMovie}
            onResetFilters={resetFilters}
          />
        </section>
      ) : (
        <section id="panel-history" role="tabpanel" aria-labelledby="tab-history">
          <RecommendationHistory
            sessions={library.history}
            onReopen={reopenSession}
            onRemove={library.removeSession}
            onRestore={library.restoreSession}
            availableMovieIds={availableMovieIds}
            catalogReady={catalog.status === 'ready'}
          />
        </section>
      )}

      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        title="Clear saved account data?"
        description="This removes every saved movie and recommendation reel from your account on every device. Your current taste reel is not affected."
      >
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => setClearDialogOpen(false)}>
            Keep my data
          </Button>
          <Button type="button" variant="danger" onClick={clearSavedData}>
            Clear saved data
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

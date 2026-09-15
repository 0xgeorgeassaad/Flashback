import { useState } from 'react'
import { PageIntro } from '../components/ui/PageIntro'
import { LibraryToolbar } from '../features/library/components/LibraryToolbar'
import { RecommendationHistory } from '../features/library/components/RecommendationHistory'
import { SavedMovies } from '../features/library/components/SavedMovies'
import { useLibrary } from '../features/library/useLibrary'
import type { RecommendationSession } from '../types'

type Tab = 'saved' | 'history'

export function MyListPage() {
  const [tab, setTab] =
    useState<Tab>('saved')

  const library = useLibrary()

  function handleReopen(
    session: RecommendationSession,
  ) {
    console.log(
      'Reopen session',
      session,
    )
  }

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Contributor 6 · Local library"
        title="Keep the ones worth remembering."
        description="Saved movies and recent recommendation sessions live only in this browser; no account required."
      />

      <div
        role="tablist"
        aria-label="My List sections"
        className="flex gap-2 border-b border-haze/20"
      >
        <button
          role="tab"
          id="tab-saved"
          aria-selected={tab === 'saved'}
          aria-controls="panel-saved"
          type="button"
          onClick={() =>
            setTab('saved')
          }
          className={`px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-marquee ${
            tab === 'saved'
              ? 'border-b-2 border-marquee text-screen'
              : 'text-haze'
          }`}
        >
          Saved movies ({library.totalSaved})
        </button>

        <button
          role="tab"
          id="tab-history"
          aria-selected={tab === 'history'}
          aria-controls="panel-history"
          type="button"
          onClick={() =>
            setTab('history')
          }
          className={`px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-marquee ${
            tab === 'history'
              ? 'border-b-2 border-marquee text-screen'
              : 'text-haze'
          }`}
        >
          Recommendation history (
          {library.history.length})
        </button>
      </div>

      {tab === 'saved' && (
        <section
          id="panel-saved"
          role="tabpanel"
          aria-labelledby="tab-saved"
          className="space-y-4"
        >
          <LibraryToolbar
            query={library.query}
            onQueryChange={
              library.setQuery
            }
            filter={library.filter}
            onFilterChange={
              library.setFilter
            }
            sort={library.sort}
            onSortChange={
              library.setSort
            }
          />

          <SavedMovies
            movies={library.savedMovies}
            totalSaved={
              library.totalSaved
            }
            onToggleWatched={
              library.toggleWatched
            }
            onRemove={
              library.removeMovie
            }
            onRestore={
              library.restoreMovie
            }
          />
        </section>
      )}

      {tab === 'history' && (
        <section
          id="panel-history"
          role="tabpanel"
          aria-labelledby="tab-history"
        >
          <RecommendationHistory
            sessions={library.history}
            onReopen={handleReopen}
            onRemove={
              library.removeSession
            }
            onRestore={
              library.restoreSession
            }
          />
        </section>
      )}
    </div>
  )
} 
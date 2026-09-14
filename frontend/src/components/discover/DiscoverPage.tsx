import type { ReactNode } from 'react'
import { Button } from '../ui/Button'
import { Skeleton } from '../ui/Skeleton'
import { useMovieFilters, type EnrichedMovie } from '../../hooks/useMovieFilters'
import type { ViewMode } from '../../types'
import { MovieSearch } from './MovieSearch'
import { FilterPanel } from './FilterPanel'

export type ResultsViewProps = {
  items: EnrichedMovie[]
  viewMode: ViewMode
  query: string
}

type DiscoverPageProps = {
  // Contributor 3's result-card component. See hooks/useMovieFilters.ts
  // for the exact contract passed into it.
  ResultsView: (props: ResultsViewProps) => ReactNode
}

/**
 * Control portion of the Discover page. Owns search, filters, sorting,
 * view mode, URL sync, and pagination — plus loading / error /
 * zero-results states, driven by CatalogContext's `status`.
 */
export function DiscoverPage({ ResultsView }: DiscoverPageProps) {
  const filters = useMovieFilters()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <MovieSearch value={filters.filters.query} onChange={filters.setQuery} />
        <FilterPanel
          availableGenres={filters.availableGenres}
          selectedGenres={filters.filters.genres}
          onToggleGenre={filters.toggleGenre}
          availableDecades={filters.availableDecades}
          selectedDecades={filters.filters.decades}
          onToggleDecade={filters.toggleDecade}
          sort={filters.filters.sort}
          onSortChange={filters.setSort}
          view={filters.filters.view}
          onViewChange={filters.setView}
          activeFilterChips={filters.activeFilterChips}
          onClearAll={filters.clearAllFilters}
        />
      </div>

      <div aria-live="polite">
        {(filters.status === 'loading' || filters.status === 'idle') && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-label="Loading catalog">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} rounded="lg" className="aspect-[2/3] w-full" />
            ))}
          </div>
        )}

        {filters.status === 'error' && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-haze">{filters.error ?? "We couldn't load the movie catalog."}</p>
            <Button variant="secondary" size="sm" onClick={filters.reload}>
              Try again
            </Button>
          </div>
        )}

        {filters.status === 'ready' && filters.isEmpty && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-haze">No titles match these filters.</p>
            <Button variant="secondary" size="sm" onClick={filters.clearAllFilters}>
              Reset filters
            </Button>
          </div>
        )}

        {filters.status === 'ready' && !filters.isEmpty && (
          <>
            <ResultsView items={filters.results} viewMode={filters.filters.view} query={filters.filters.query} />
            {filters.hasMore && (
              <div className="mt-6 flex justify-center">
                <Button variant="secondary" onClick={filters.loadMore}>
                  Load more ({filters.totalCount - filters.results.length} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

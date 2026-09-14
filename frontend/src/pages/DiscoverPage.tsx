import { PageIntro } from '../components/ui/PageIntro'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { FilterPanel } from '../features/catalog/components/FilterPanel'
import { MovieGrid } from '../features/catalog/components/MovieGrid'
import { MovieSearch } from '../features/catalog/components/MovieSearch'
import { useMovieFilters } from '../features/catalog/hooks/useMovieFilters'
import { SelectionTray } from '../features/taste/components/SelectionTray'

export function DiscoverPage() {
  const filters = useMovieFilters()

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Contributor 2 · Discovery / Contributor 3 · Catalog"
        title="Search the shelves. Find your five."
        description="Use titles, genres, and decades to find the films that best represent what you enjoy."
      />

      <MovieSearch />
      <FilterPanel />

      <div aria-live="polite">
        {(filters.status === 'loading' || filters.status === 'idle') && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5" aria-label="Loading catalog">
            {Array.from({ length: 10 }).map((_, index) => (
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
            <MovieGrid movies={filters.results} view={filters.filters.view} />
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

      <div className="sticky bottom-4 z-30">
        <SelectionTray />
      </div>
    </div>
  )
}
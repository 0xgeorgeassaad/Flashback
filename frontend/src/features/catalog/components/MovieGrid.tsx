import type { Movie, ViewMode } from '../../../types'
import { useCatalog } from '../../../state/CatalogContext'
import { useTaste } from '../../../state/TasteContext'
import { CATALOG_PAGE_SIZE } from '../../../constants'
import { Button } from '../../../components/ui/Button'
import { MovieCard, MovieCardSkeleton } from './MovieCard'

type MovieGridProps = {
  /** Optional override list (e.g. already filtered/paginated by Contributor 2). Defaults to a capped slice of the full catalog. */
  movies?: Movie[]
  view?: ViewMode
  query?: string
}

export function MovieGrid({ movies, view = 'grid', query = '' }: MovieGridProps) {
  const { movies: catalogMovies, status, error, reload } = useCatalog()
  const { selectedMovies, toggleMovie } = useTaste()

  // Only cap the fallback path. Contributor 2 can pass a filtered and paginated list through `movies`.
  const list = movies ?? catalogMovies.slice(0, CATALOG_PAGE_SIZE)
  const isSelected = (movieId: number) => selectedMovies.some((m) => m.movieId === movieId)

  const gridClasses =
    view === 'list' ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-ticket/50 bg-ticket/10 p-5 text-sm text-screen">
        <p>{error}</p>
        <Button type="button" variant="secondary" size="sm" onClick={reload} className="mt-3">
          Try loading again
        </Button>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className={gridClasses}>
        {Array.from({ length: 10 }, (_, index) => (
          <MovieCardSkeleton key={index} view={view} />
        ))}
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-reel/40 p-8 text-center text-sm text-haze">
        No movies to show here yet.
      </div>
    )
  }

  return (
    <div className={gridClasses}>
      {list.map((movie) => (
        <MovieCard
          key={movie.movieId}
          movie={movie}
          view={view}
          selected={isSelected(movie.movieId)}
          onToggle={toggleMovie}
          highlightQuery={query}
        />
      ))}
    </div>
  )
}

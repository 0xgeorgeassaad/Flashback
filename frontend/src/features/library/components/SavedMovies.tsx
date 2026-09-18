import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import type { SavedMovie } from '../../../types'
import { MovieCard } from '../../catalog/components/MovieCard'

type SavedMoviesProps = {
  movies: SavedMovie[]
  totalSaved: number
  onToggleWatched: (movieId: number) => void
  onRemove: (movieId: number) => SavedMovie | undefined
  onRestore: (movie: SavedMovie) => void
  onResetFilters: () => void
}

export function SavedMovies({
  movies,
  totalSaved,
  onToggleWatched,
  onRemove,
  onRestore,
  onResetFilters,
}: SavedMoviesProps) {
  const [pendingUndo, setPendingUndo] = useState<SavedMovie | null>(null)

  useEffect(() => {
    if (!pendingUndo) return
    const timer = window.setTimeout(() => setPendingUndo(null), 6000)
    return () => window.clearTimeout(timer)
  }, [pendingUndo])

  function handleRemove(movieId: number) {
    const removed = onRemove(movieId)
    if (removed) setPendingUndo(removed)
  }

  function handleUndo() {
    if (!pendingUndo) return
    onRestore(pendingUndo)
    setPendingUndo(null)
  }

  return (
    <div className="space-y-4">
      {pendingUndo ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-marquee/35 bg-marquee/10 px-4 py-3 text-sm text-screen"
        >
          <span>Removed “{pendingUndo.title}”.</span>
          <Button type="button" size="sm" variant="secondary" onClick={handleUndo}>
            Undo removal
          </Button>
        </div>
      ) : null}

      {totalSaved === 0 ? (
        <div className="archive-grid rounded-panel border border-dashed border-line bg-reel/35 p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl text-screen">Your list is ready for its first title.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-haze">
            Save a recommendation when a title feels worth returning to. It will be available on every device where you sign in.
          </p>
          <Link
            to="/discover"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-marquee bg-marquee px-5 text-sm font-semibold text-booth transition-colors hover:border-screen hover:bg-screen"
          >
            Discover movies
          </Link>
        </div>
      ) : movies.length === 0 ? (
        <div className="rounded-panel border border-line bg-reel/45 p-8 text-center">
          <h2 className="font-display text-xl text-screen">No saved movies match.</h2>
          <p className="mt-2 text-sm text-haze">Clear the search and status filter to see your full list.</p>
          <Button type="button" variant="secondary" size="sm" className="mt-5" onClick={onResetFilters}>
            Reset filters
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {movies.map((entry) => (
            <li key={entry.movieId}>
              <MovieCard
                movie={entry}
                primaryAction={
                  <div className="flex flex-1 items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={entry.watched ? 'primary' : 'secondary'}
                      onClick={() => onToggleWatched(entry.movieId)}
                      aria-pressed={entry.watched}
                      className="flex-1"
                    >
                      {entry.watched ? 'Watched' : 'Mark watched'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleRemove(entry.movieId)}
                      className="min-h-9 rounded-full px-2 text-xs font-semibold text-ticket underline-offset-4 hover:underline"
                      aria-label={`Remove ${entry.title} from My List`}
                    >
                      Remove
                    </button>
                  </div>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { useState } from 'react'
import type { SavedMovie } from '../../../types'
import { MovieCard } from '../../catalog/components/MovieCard'

interface SavedMoviesProps {
  movies: SavedMovie[]
  totalSaved: number
  onToggleWatched: (movieId: number) => void
  onRemove: (movieId: number) => SavedMovie | undefined
  onRestore: (movie: SavedMovie) => void
}

export function SavedMovies({
  movies,
  totalSaved,
  onToggleWatched,
  onRemove,
  onRestore,
}: SavedMoviesProps) {
  const [pendingUndo, setPendingUndo] =
    useState<SavedMovie | null>(null)

  function handleRemove(movieId: number) {
    const removed = onRemove(movieId)

    if (!removed) return

    setPendingUndo(removed)

    window.setTimeout(() => {
      setPendingUndo((current) =>
        current?.movieId === removed.movieId
          ? null
          : current,
      )
    }, 6000)
  }

  function handleUndo() {
    if (!pendingUndo) return

    onRestore(pendingUndo)
    setPendingUndo(null)
  }

  if (totalSaved === 0) {
    return (
      <p className="rounded-lg bg-reel p-6 text-center text-haze">
        You haven&apos;t saved any movies yet.
        Save titles from your results to build
        your list here.
      </p>
    )
  }

  if (movies.length === 0) {
    return (
      <p className="rounded-lg bg-reel p-6 text-center text-haze">
        No saved movies match your current search
        or filter.
      </p>
    )
  }

  return (
    <div>
      {pendingUndo && (
        <div
          role="status"
          className="mb-4 flex items-center justify-between rounded-md bg-ticket/20 px-4 py-2 text-sm text-screen"
        >
          <span>
            Removed “{pendingUndo.title}”.
          </span>

          <button
            type="button"
            onClick={handleUndo}
            className="font-semibold text-marquee underline focus:outline-none focus:ring-2 focus:ring-marquee"
          >
            Undo
          </button>
        </div>
      )}

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {movies.map((entry) => (
          <li key={entry.movieId}>
            <MovieCard
              movie={entry}
              primaryAction={
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onToggleWatched(
                        entry.movieId,
                      )
                    }
                    aria-pressed={entry.watched}
                    className={`rounded-full px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-marquee ${
                      entry.watched
                        ? 'bg-marquee text-booth'
                        : 'bg-booth text-haze'
                    }`}
                  >
                    {entry.watched
                      ? 'Watched'
                      : 'Mark watched'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemove(
                        entry.movieId,
                      )
                    }
                    className="text-xs text-ticket underline focus:outline-none focus:ring-2 focus:ring-marquee"
                  >
                    Remove
                  </button>
                </div>
              }
            />
          </li>
        ))}
      </ul>
    </div>
  )
} 
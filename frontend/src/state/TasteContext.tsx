/* oxlint-disable react/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import type { Movie } from '../types'

type TasteContextValue = {
  selectedMovies: Movie[]
  selectedIds: Set<number>
  toggleMovie: (movie: Movie) => void
  clearSelection: () => void
}

const TasteContext = createContext<TasteContextValue | null>(null)

export function TasteProvider({ children }: { children: React.ReactNode }) {
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([])

  const selectedIds = useMemo(
    () => new Set(selectedMovies.map((movie) => movie.movieId)),
    [selectedMovies],
  )

  function toggleMovie(_movie: Movie) {
    // TODO [Contributor 4]: add/remove without duplicates, then persist the draft.
    setSelectedMovies((current) => current)
  }

  function clearSelection() {
    // TODO [Contributor 4]: clear state and the localStorage draft.
    setSelectedMovies([])
  }

  const value = useMemo(
    () => ({ selectedMovies, selectedIds, toggleMovie, clearSelection }),
    [selectedMovies, selectedIds],
  )

  return <TasteContext.Provider value={value}>{children}</TasteContext.Provider>
}

export function useTaste() {
  const context = useContext(TasteContext)
  if (!context) throw new Error('useTaste must be used inside TasteProvider')
  return context
}

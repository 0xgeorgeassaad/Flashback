/* oxlint-disable react/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { fetchTasteSelection, updateTasteSelection } from '../api/client'
import type { Movie, SelectedMoviePayload } from '../types'

interface TasteContextType {
  selectedMovies: Movie[]
  addMovie: (movie: Movie) => void
  removeMovie: (movieId: number) => void
  toggleMovie: (movie: Movie) => void
  replaceSelection: (movies: Movie[]) => void
  clearSelection: () => void
  lastRemovedMovie: Movie | null
  undoRemove: () => void
  genreDistribution: Record<string, number>
  isValidSelection: boolean
  recommendationPayload: SelectedMoviePayload[]
  loading: boolean
  error: string | null
}

const TasteContext = createContext<TasteContextType | undefined>(undefined)

export const TasteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([])
  const selectionRef = useRef<Movie[]>([])
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve())
  const [lastRemovedMovie, setLastRemovedMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void fetchTasteSelection()
      .then((movies) => {
        if (!active) return
        selectionRef.current = movies
        setSelectedMovies(movies)
      })
      .catch((loadError) => {
        if (!active) return
        setError(loadError instanceof Error ? loadError.message : 'Your taste reel could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const applySelection = useCallback((movies: Movie[]) => {
    selectionRef.current = movies
    setSelectedMovies(movies)
    setError(null)
    saveQueue.current = saveQueue.current
      .catch(() => undefined)
      .then(() => updateTasteSelection(movies))
      .catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : 'Your taste reel could not be saved.')
      })
  }, [])

  const addMovie = useCallback((movie: Movie) => {
    if (selectionRef.current.some((item) => item.movieId === movie.movieId)) return
    applySelection([...selectionRef.current, movie])
  }, [applySelection])

  const removeMovie = useCallback((movieId: number) => {
    const movieToRemove = selectionRef.current.find((movie) => movie.movieId === movieId)
    if (!movieToRemove) return
    setLastRemovedMovie(movieToRemove)
    applySelection(selectionRef.current.filter((movie) => movie.movieId !== movieId))
  }, [applySelection])

  const toggleMovie = useCallback((movie: Movie) => {
    if (selectionRef.current.some((item) => item.movieId === movie.movieId)) {
      removeMovie(movie.movieId)
    } else {
      addMovie(movie)
    }
  }, [addMovie, removeMovie])

  const clearSelection = useCallback(() => applySelection([]), [applySelection])

  const replaceSelection = useCallback((movies: Movie[]) => {
    const uniqueMovies = movies.filter(
      (movie, index) => movies.findIndex((candidate) => candidate.movieId === movie.movieId) === index,
    )
    applySelection(uniqueMovies)
  }, [applySelection])

  const undoRemove = useCallback(() => {
    if (!lastRemovedMovie) return
    addMovie(lastRemovedMovie)
    setLastRemovedMovie(null)
  }, [addMovie, lastRemovedMovie])

  const genreDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    selectedMovies.forEach((movie) => {
      movie.genres?.forEach((genre) => {
        counts[genre] = (counts[genre] || 0) + 1
      })
    })
    return counts
  }, [selectedMovies])

  const recommendationPayload: SelectedMoviePayload[] = useMemo(
    () => selectedMovies.map((movie) => ({ movieId: movie.movieId, rating: 5 })),
    [selectedMovies],
  )

  return (
    <TasteContext.Provider
      value={{
        selectedMovies,
        addMovie,
        removeMovie,
        toggleMovie,
        replaceSelection,
        clearSelection,
        lastRemovedMovie,
        undoRemove,
        genreDistribution,
        isValidSelection: selectedMovies.length >= 5,
        recommendationPayload,
        loading,
        error,
      }}
    >
      {children}
    </TasteContext.Provider>
  )
}

export const useTaste = () => {
  const context = useContext(TasteContext)
  if (!context) throw new Error('useTaste must be used within a TasteProvider')
  return context
}

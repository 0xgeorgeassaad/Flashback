import { useCallback, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../../constants'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { isRecommendationSessionArray, isSavedMovieArray } from '../../lib/guards'
import type { Movie, RecommendationSession, SavedMovie } from '../../types'

const EMPTY_SAVED_MOVIES: SavedMovie[] = []
const EMPTY_HISTORY: RecommendationSession[] = []

const SAVED_MOVIE_OPTIONS = {
  validate: isSavedMovieArray,
  legacyKeys: ['flashback:library'],
} as const

const HISTORY_OPTIONS = {
  validate: isRecommendationSessionArray,
  legacyKeys: ['flashback:history'],
} as const

export type LibraryFilter = 'all' | 'watched' | 'unwatched'
export type LibrarySort = 'recent' | 'title'

export function useLibraryState() {
  const [savedMovies, setSavedMovies, resetSavedMovies, savedMeta] = useLocalStorage(
    STORAGE_KEYS.savedMovies,
    EMPTY_SAVED_MOVIES,
    SAVED_MOVIE_OPTIONS,
  )
  const [history, setHistory, resetHistory, historyMeta] = useLocalStorage(
    STORAGE_KEYS.recommendationHistory,
    EMPTY_HISTORY,
    HISTORY_OPTIONS,
  )
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<LibraryFilter>('all')
  const [sort, setSort] = useState<LibrarySort>('recent')

  const isSaved = useCallback(
    (movieId: number) => savedMovies.some((movie) => movie.movieId === movieId),
    [savedMovies],
  )

  const saveMovie = useCallback(
    (movie: Movie) => {
      setSavedMovies((current) => {
        if (current.some((item) => item.movieId === movie.movieId)) return current

        return [
          { ...movie, watched: false, savedAt: new Date().toISOString() },
          ...current,
        ]
      })
    },
    [setSavedMovies],
  )

  const removeMovie = useCallback(
    (movieId: number) => {
      const removed = savedMovies.find((movie) => movie.movieId === movieId)
      setSavedMovies((current) => current.filter((movie) => movie.movieId !== movieId))
      return removed
    },
    [savedMovies, setSavedMovies],
  )

  const restoreMovie = useCallback(
    (movie: SavedMovie) => {
      setSavedMovies((current) =>
        current.some((item) => item.movieId === movie.movieId) ? current : [movie, ...current],
      )
    },
    [setSavedMovies],
  )

  const toggleWatched = useCallback(
    (movieId: number) => {
      setSavedMovies((current) =>
        current.map((movie) =>
          movie.movieId === movieId ? { ...movie, watched: !movie.watched } : movie,
        ),
      )
    },
    [setSavedMovies],
  )

  const saveSession = useCallback(
    (session: RecommendationSession) => {
      setHistory((current) =>
        current.some((item) => item.id === session.id) ? current : [session, ...current],
      )
    },
    [setHistory],
  )

  const removeSession = useCallback(
    (sessionId: string) => {
      setHistory((current) => current.filter((session) => session.id !== sessionId))
    },
    [setHistory],
  )

  const restoreSession = useCallback(
    (session: RecommendationSession) => {
      setHistory((current) =>
        current.some((item) => item.id === session.id) ? current : [session, ...current],
      )
    },
    [setHistory],
  )

  const findSession = useCallback(
    (sessionId: string) => history.find((session) => session.id === sessionId),
    [history],
  )

  const clearLibrary = useCallback(() => {
    resetSavedMovies()
    resetHistory()
    setQuery('')
    setFilter('all')
    setSort('recent')
  }, [resetHistory, resetSavedMovies])

  const dismissRecoveryNotice = useCallback(() => {
    savedMeta.dismissRecovery()
    historyMeta.dismissRecovery()
  }, [historyMeta, savedMeta])

  const visibleMovies = useMemo(() => {
    const search = query.trim().toLocaleLowerCase()
    const filtered = savedMovies.filter((movie) => {
      const matchesStatus =
        filter === 'all' ||
        (filter === 'watched' && movie.watched) ||
        (filter === 'unwatched' && !movie.watched)
      const matchesQuery = !search || movie.title.toLocaleLowerCase().includes(search)
      return matchesStatus && matchesQuery
    })

    return [...filtered].sort((first, second) => {
      if (sort === 'title') return first.title.localeCompare(second.title)
      return Date.parse(second.savedAt) - Date.parse(first.savedAt)
    })
  }, [filter, query, savedMovies, sort])

  return {
    savedMovies: visibleMovies,
    allSavedMovies: savedMovies,
    totalSaved: savedMovies.length,
    isSaved,
    saveMovie,
    removeMovie,
    restoreMovie,
    toggleWatched,
    history,
    saveSession,
    removeSession,
    restoreSession,
    findSession,
    clearLibrary,
    recoveredStorage: savedMeta.recovered || historyMeta.recovered,
    dismissRecoveryNotice,
    query,
    setQuery,
    filter,
    setFilter,
    sort,
    setSort,
  }
}

export type LibraryState = ReturnType<typeof useLibraryState>

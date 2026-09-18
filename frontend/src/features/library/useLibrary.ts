import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  clearAccountLibrary,
  createRecommendationSession,
  createSavedMovie,
  deleteRecommendationSession,
  deleteSavedMovie,
  fetchRecommendationSessions,
  fetchSavedMovies,
  setSavedMovieWatched,
} from '../../api/client'
import type { Movie, RecommendationSession, SavedMovie } from '../../types'

export type LibraryFilter = 'all' | 'watched' | 'unwatched'
export type LibrarySort = 'recent' | 'title'

export function useLibraryState() {
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([])
  const [history, setHistory] = useState<RecommendationSession[]>([])
  const savedRef = useRef<SavedMovie[]>([])
  const historyRef = useRef<RecommendationSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadVersion, setLoadVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<LibraryFilter>('all')
  const [sort, setSort] = useState<LibrarySort>('recent')

  const applySavedMovies = useCallback((movies: SavedMovie[]) => {
    savedRef.current = movies
    setSavedMovies(movies)
  }, [])

  const applyHistory = useCallback((sessions: RecommendationSession[]) => {
    historyRef.current = sessions
    setHistory(sessions)
  }, [])

  useEffect(() => {
    let active = true
    void Promise.all([fetchSavedMovies(), fetchRecommendationSessions()])
      .then(([movies, sessions]) => {
        if (!active) return
        applySavedMovies(movies)
        applyHistory(sessions)
      })
      .catch((loadError) => {
        if (!active) return
        setError(loadError instanceof Error ? loadError.message : 'Your library could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [applyHistory, applySavedMovies, loadVersion])

  const reportError = useCallback((operationError: unknown, fallback: string) => {
    setError(operationError instanceof Error ? operationError.message : fallback)
  }, [])

  const isSaved = useCallback(
    (movieId: number) => savedMovies.some((movie) => movie.movieId === movieId),
    [savedMovies],
  )

  const saveMovie = useCallback((movie: Movie) => {
    if (savedRef.current.some((item) => item.movieId === movie.movieId)) return
    const optimistic: SavedMovie = {
      ...movie,
      watched: false,
      savedAt: new Date().toISOString(),
    }
    applySavedMovies([optimistic, ...savedRef.current])
    setError(null)
    void createSavedMovie(movie.movieId)
      .then((saved) => {
        applySavedMovies(
          savedRef.current.map((item) => (item.movieId === saved.movieId ? saved : item)),
        )
      })
      .catch((saveError) => {
        applySavedMovies(savedRef.current.filter((item) => item.movieId !== movie.movieId))
        reportError(saveError, 'The movie could not be saved.')
      })
  }, [applySavedMovies, reportError])

  const removeMovie = useCallback((movieId: number) => {
    const removed = savedRef.current.find((movie) => movie.movieId === movieId)
    if (!removed) return undefined
    applySavedMovies(savedRef.current.filter((movie) => movie.movieId !== movieId))
    setError(null)
    void deleteSavedMovie(movieId).catch((removeError) => {
      applySavedMovies([removed, ...savedRef.current])
      reportError(removeError, 'The movie could not be removed.')
    })
    return removed
  }, [applySavedMovies, reportError])

  const restoreMovie = useCallback((movie: SavedMovie) => {
    if (savedRef.current.some((item) => item.movieId === movie.movieId)) return
    applySavedMovies([movie, ...savedRef.current])
    setError(null)
    void createSavedMovie(movie.movieId)
      .then((saved) =>
        movie.watched ? setSavedMovieWatched(saved.movieId, true) : Promise.resolve(saved),
      )
      .then((saved) => {
        applySavedMovies(
          savedRef.current.map((item) => (item.movieId === saved.movieId ? saved : item)),
        )
      })
      .catch((restoreError) => {
        applySavedMovies(savedRef.current.filter((item) => item.movieId !== movie.movieId))
        reportError(restoreError, 'The movie could not be restored.')
      })
  }, [applySavedMovies, reportError])

  const toggleWatched = useCallback((movieId: number) => {
    const current = savedRef.current.find((movie) => movie.movieId === movieId)
    if (!current) return
    const watched = !current.watched
    applySavedMovies(
      savedRef.current.map((movie) =>
        movie.movieId === movieId ? { ...movie, watched } : movie,
      ),
    )
    setError(null)
    void setSavedMovieWatched(movieId, watched)
      .then((saved) => {
        applySavedMovies(
          savedRef.current.map((movie) => (movie.movieId === movieId ? saved : movie)),
        )
      })
      .catch((updateError) => {
        applySavedMovies(
          savedRef.current.map((movie) => (movie.movieId === movieId ? current : movie)),
        )
        reportError(updateError, 'The watched status could not be updated.')
      })
  }, [applySavedMovies, reportError])

  const saveSession = useCallback((session: RecommendationSession) => {
    if (historyRef.current.some((item) => item.id === session.id)) return
    applyHistory([session, ...historyRef.current])
    setError(null)
    void createRecommendationSession(session)
      .then((saved) => {
        applyHistory(historyRef.current.map((item) => (item.id === saved.id ? saved : item)))
      })
      .catch((saveError) => {
        applyHistory(historyRef.current.filter((item) => item.id !== session.id))
        reportError(saveError, 'The recommendation reel could not be saved.')
      })
  }, [applyHistory, reportError])

  const removeSession = useCallback((sessionId: string) => {
    const removed = historyRef.current.find((session) => session.id === sessionId)
    if (!removed) return
    applyHistory(historyRef.current.filter((session) => session.id !== sessionId))
    setError(null)
    void deleteRecommendationSession(sessionId).catch((removeError) => {
      applyHistory([removed, ...historyRef.current])
      reportError(removeError, 'The recommendation reel could not be removed.')
    })
  }, [applyHistory, reportError])

  const restoreSession = useCallback((session: RecommendationSession) => {
    if (historyRef.current.some((item) => item.id === session.id)) return
    applyHistory([session, ...historyRef.current])
    setError(null)
    void createRecommendationSession(session).catch((restoreError) => {
      applyHistory(historyRef.current.filter((item) => item.id !== session.id))
      reportError(restoreError, 'The recommendation reel could not be restored.')
    })
  }, [applyHistory, reportError])

  const findSession = useCallback(
    (sessionId: string) => history.find((session) => session.id === sessionId),
    [history],
  )

  const clearLibrary = useCallback(() => {
    const previousMovies = savedRef.current
    const previousHistory = historyRef.current
    applySavedMovies([])
    applyHistory([])
    setQuery('')
    setFilter('all')
    setSort('recent')
    setError(null)
    void clearAccountLibrary().catch((clearError) => {
      applySavedMovies(previousMovies)
      applyHistory(previousHistory)
      reportError(clearError, 'Your library could not be cleared.')
    })
  }, [applyHistory, applySavedMovies, reportError])

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    setLoadVersion((version) => version + 1)
  }, [])

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
    loading,
    error,
    reload,
    query,
    setQuery,
    filter,
    setFilter,
    sort,
    setSort,
  }
}

export type LibraryState = ReturnType<typeof useLibraryState>

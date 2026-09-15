import { useMemo, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import type {
  Movie,
  RecommendationSession,
  SavedMovie,
} from '../../types'

const LIBRARY_STORAGE_KEY = 'flashback:library'
const HISTORY_STORAGE_KEY = 'flashback:history'

export type LibraryFilter = 'all' | 'watched' | 'unwatched'
export type LibrarySort = 'recent' | 'title'

export function useLibrary() {
  const [savedMovies, setSavedMovies] = useLocalStorage<SavedMovie[]>(
    LIBRARY_STORAGE_KEY,
    [],
  )

  const [history, setHistory] =
    useLocalStorage<RecommendationSession[]>(
      HISTORY_STORAGE_KEY,
      [],
    )

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<LibraryFilter>('all')
  const [sort, setSort] = useState<LibrarySort>('recent')

  function isSaved(movieId: number) {
    return savedMovies.some(
      (movie) => movie.movieId === movieId,
    )
  }

  function saveMovie(movie: Movie) {
    setSavedMovies((current) => {
      if (
        current.some(
          (item) => item.movieId === movie.movieId,
        )
      ) {
        return current
      }

      return [
        {
          ...movie,
          watched: false,
          savedAt: new Date().toISOString(),
        },
        ...current,
      ]
    })
  }

  function removeMovie(movieId: number) {
    const removed = savedMovies.find(
      (movie) => movie.movieId === movieId,
    )

    setSavedMovies((current) =>
      current.filter(
        (movie) => movie.movieId !== movieId,
      ),
    )

    return removed
  }

  function restoreMovie(movie: SavedMovie) {
    setSavedMovies((current) => {
      if (
        current.some(
          (item) => item.movieId === movie.movieId,
        )
      ) {
        return current
      }

      return [movie, ...current]
    })
  }

  function toggleWatched(movieId: number) {
    setSavedMovies((current) =>
      current.map((movie) =>
        movie.movieId === movieId
          ? {
              ...movie,
              watched: !movie.watched,
            }
          : movie,
      ),
    )
  }

  function saveSession(session: RecommendationSession) {
    setHistory((current) => [
      session,
      ...current,
    ])
  }

  function removeSession(sessionId: string) {
    setHistory((current) =>
      current.filter(
        (session) => session.id !== sessionId,
      ),
    )
  }

  function restoreSession(
    session: RecommendationSession,
  ) {
    setHistory((current) => {
      if (
        current.some(
          (item) => item.id === session.id,
        )
      ) {
        return current
      }

      return [session, ...current]
    })
  }

  const visibleMovies = useMemo(() => {
    let movies = savedMovies

    if (filter === 'watched') {
      movies = movies.filter(
        (movie) => movie.watched,
      )
    }

    if (filter === 'unwatched') {
      movies = movies.filter(
        (movie) => !movie.watched,
      )
    }

    if (query.trim()) {
      const search = query.trim().toLowerCase()

      movies = movies.filter((movie) =>
        movie.title
          .toLowerCase()
          .includes(search),
      )
    }

    const sortedMovies = [...movies]

    if (sort === 'title') {
      sortedMovies.sort((a, b) =>
        a.title.localeCompare(b.title),
      )
    } else {
      sortedMovies.sort(
        (a, b) =>
          new Date(b.savedAt).getTime() -
          new Date(a.savedAt).getTime(),
      )
    }

    return sortedMovies
  }, [
    savedMovies,
    query,
    filter,
    sort,
  ])

  return {
    savedMovies: visibleMovies,
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

    query,
    setQuery,
    filter,
    setFilter,
    sort,
    setSort,
  }
} 
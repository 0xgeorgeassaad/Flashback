import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createSavedMovie,
  fetchRecommendationSessions,
  fetchSavedMovies,
  setSavedMovieWatched,
} from '../../api/client'
import type { Movie, SavedMovie } from '../../types'
import { useLibraryState } from './useLibrary'

vi.mock('../../api/client', () => ({
  clearAccountLibrary: vi.fn().mockResolvedValue(undefined),
  createRecommendationSession: vi.fn(),
  createSavedMovie: vi.fn(),
  deleteRecommendationSession: vi.fn().mockResolvedValue(undefined),
  deleteSavedMovie: vi.fn().mockResolvedValue(undefined),
  fetchRecommendationSessions: vi.fn(),
  fetchSavedMovies: vi.fn(),
  setSavedMovieWatched: vi.fn(),
}))

const movie: Movie = {
  movieId: 50,
  title: 'The Usual Suspects (1995)',
  genres: ['Crime', 'Mystery', 'Thriller'],
  posterPath: '/poster.jpg',
}

const savedMovie: SavedMovie = {
  ...movie,
  watched: false,
  savedAt: '2026-09-18T12:00:00.000Z',
}

describe('useLibraryState', () => {
  beforeEach(() => {
    vi.mocked(fetchSavedMovies).mockResolvedValue([])
    vi.mocked(fetchRecommendationSessions).mockResolvedValue([])
    vi.mocked(createSavedMovie).mockResolvedValue(savedMovie)
    vi.mocked(setSavedMovieWatched).mockImplementation(async (_movieId, watched) => ({
      ...savedMovie,
      watched,
    }))
  })

  it('loads saved movies from the account API', async () => {
    vi.mocked(fetchSavedMovies).mockResolvedValue([savedMovie])
    const { result } = renderHook(useLibraryState)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.savedMovies).toEqual([savedMovie])
  })

  it('saves a movie and synchronizes watched status', async () => {
    const { result } = renderHook(useLibraryState)
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.saveMovie(movie))
    await waitFor(() => expect(createSavedMovie).toHaveBeenCalledWith(movie.movieId))

    act(() => result.current.toggleWatched(movie.movieId))
    await waitFor(() => expect(setSavedMovieWatched).toHaveBeenCalledWith(movie.movieId, true))
    expect(result.current.savedMovies[0].watched).toBe(true)
  })

  it('reports account data loading errors', async () => {
    vi.mocked(fetchSavedMovies).mockRejectedValue(new Error('Library unavailable'))
    const { result } = renderHook(useLibraryState)

    await waitFor(() => expect(result.current.error).toBe('Library unavailable'))
  })
})

import type { PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchTasteSelection, updateTasteSelection } from '../api/client'
import type { Movie } from '../types'
import { TasteProvider, useTaste } from './TasteContext'

vi.mock('../api/client', () => ({
  fetchTasteSelection: vi.fn(),
  updateTasteSelection: vi.fn(),
}))

const movies: Movie[] = Array.from({ length: 5 }, (_, index) => ({
  movieId: index + 1,
  title: `Movie ${index + 1} (200${index})`,
  genres: index % 2 === 0 ? ['Drama'] : ['Comedy'],
  posterPath: null,
}))

function wrapper({ children }: PropsWithChildren) {
  return <TasteProvider>{children}</TasteProvider>
}

describe('TasteContext', () => {
  beforeEach(() => {
    vi.mocked(fetchTasteSelection).mockResolvedValue([])
    vi.mocked(updateTasteSelection).mockImplementation(async (selection) => selection)
  })

  it('deduplicates selections and synchronizes the recommendation payload', async () => {
    const { result } = renderHook(useTaste, { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      for (const movie of movies) result.current.addMovie(movie)
      result.current.addMovie(movies[0])
    })

    expect(result.current.selectedMovies).toHaveLength(5)
    expect(result.current.isValidSelection).toBe(true)
    expect(result.current.recommendationPayload).toEqual(
      movies.map((movie) => ({ movieId: movie.movieId, rating: 5 })),
    )
    await waitFor(() => expect(updateTasteSelection).toHaveBeenLastCalledWith(movies))
  })

  it('hydrates a saved selection from the account API', async () => {
    vi.mocked(fetchTasteSelection).mockResolvedValue(movies.slice(0, 2))

    const { result } = renderHook(useTaste, { wrapper })

    await waitFor(() =>
      expect(result.current.selectedMovies.map((movie) => movie.movieId)).toEqual([1, 2]),
    )
  })

  it('exposes synchronization failures without discarding the current selection', async () => {
    vi.mocked(updateTasteSelection).mockRejectedValue(new Error('Save failed'))
    const { result } = renderHook(useTaste, { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.addMovie(movies[0]))

    expect(result.current.selectedMovies).toEqual([movies[0]])
    await waitFor(() => expect(result.current.error).toBe('Save failed'))
  })
})

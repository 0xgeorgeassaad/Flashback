import type { PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '../constants'
import type { Movie } from '../types'
import { TasteProvider, useTaste } from './TasteContext'

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
  it('deduplicates selections and builds the recommendation payload', async () => {
    const { result } = renderHook(useTaste, { wrapper })

    for (const movie of movies) {
      act(() => result.current.addMovie(movie))
    }
    act(() => result.current.addMovie(movies[0]))

    expect(result.current.selectedMovies).toHaveLength(5)
    expect(result.current.isValidSelection).toBe(true)
    expect(result.current.recommendationPayload).toEqual(
      movies.map((movie) => ({ movieId: movie.movieId, rating: 5 })),
    )
    await waitFor(() =>
      expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.tasteDraft) ?? '[]')).toHaveLength(5),
    )
  })

  it('hydrates a saved draft after remounting', async () => {
    window.localStorage.setItem(STORAGE_KEYS.tasteDraft, JSON.stringify(movies.slice(0, 2)))

    const { result } = renderHook(useTaste, { wrapper })

    expect(result.current.selectedMovies.map((movie) => movie.movieId)).toEqual([1, 2])
  })

  it('recovers safely from malformed persisted selections', async () => {
    window.localStorage.setItem(STORAGE_KEYS.tasteDraft, '{bad json')

    const { result } = renderHook(useTaste, { wrapper })

    expect(result.current.selectedMovies).toEqual([])
    await waitFor(() => expect(window.localStorage.getItem(STORAGE_KEYS.tasteDraft)).toBe('[]'))
  })
})

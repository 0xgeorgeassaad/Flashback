import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '../../constants'
import type { Movie } from '../../types'
import { useLibraryState } from './useLibrary'

const movie: Movie = {
  movieId: 50,
  title: 'The Usual Suspects (1995)',
  genres: ['Crime', 'Mystery', 'Thriller'],
  posterPath: '/poster.jpg',
}

describe('useLibraryState', () => {
  it('persists saved movies and watched status', async () => {
    const { result, unmount } = renderHook(useLibraryState)

    act(() => result.current.saveMovie(movie))
    act(() => result.current.toggleWatched(movie.movieId))

    expect(result.current.totalSaved).toBe(1)
    expect(result.current.savedMovies[0].watched).toBe(true)
    await waitFor(() =>
      expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.savedMovies) ?? '[]')).toHaveLength(1),
    )

    unmount()
    const remounted = renderHook(useLibraryState)
    expect(remounted.result.current.savedMovies[0]).toMatchObject({ movieId: 50, watched: true })
  })

  it('recovers from malformed library data and exposes the recovery notice', async () => {
    window.localStorage.setItem(STORAGE_KEYS.savedMovies, JSON.stringify([{ movieId: 'wrong' }]))

    const { result } = renderHook(useLibraryState)

    expect(result.current.totalSaved).toBe(0)
    expect(result.current.recoveredStorage).toBe(true)
    await waitFor(() => expect(window.localStorage.getItem(STORAGE_KEYS.savedMovies)).toBe('[]'))
  })
})

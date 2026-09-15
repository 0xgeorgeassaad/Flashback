import type { PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { CatalogProvider } from '../../../state/CatalogContext'
import type { Movie } from '../../../types'
import { useMovieFilters } from './useMovieFilters'

const catalog: Movie[] = [
  {
    movieId: 1,
    title: 'Alien (1979)',
    genres: ['Horror', 'Sci-Fi'],
    posterPath: null,
  },
  {
    movieId: 2,
    title: 'The Godfather (1972)',
    genres: ['Crime', 'Drama'],
    posterPath: null,
  },
  {
    movieId: 3,
    title: 'Heat (1995)',
    genres: ['Action', 'Crime'],
    posterPath: null,
  },
  {
    movieId: 4,
    title: 'Arrival (2016)',
    genres: ['Drama', 'Sci-Fi'],
    posterPath: null,
  },
]

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function wrapper(initialEntry = '/') {
  return function TestProviders({ children }: PropsWithChildren) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>
        <CatalogProvider>{children}</CatalogProvider>
      </MemoryRouter>
    )
  }
}

describe('useMovieFilters', () => {
  it('filters case-insensitively and combines genre and decade filters', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ movies: catalog })))
    const { result } = renderHook(() => useMovieFilters(2), { wrapper: wrapper() })

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.results.map((movie) => movie.movieId)).toEqual([1, 4])
    expect(result.current.hasMore).toBe(true)

    act(() => result.current.setQuery('ALIEN'))
    await waitFor(() => expect(result.current.results.map((movie) => movie.movieId)).toEqual([1]))

    act(() => result.current.clearAllFilters())
    act(() => result.current.toggleGenre('Crime'))
    act(() => result.current.toggleDecade(1990))

    await waitFor(() => expect(result.current.results.map((movie) => movie.movieId)).toEqual([3]))
  })

  it('restores view and search state from the URL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ movies: catalog })))
    const { result } = renderHook(() => useMovieFilters(), {
      wrapper: wrapper('/?q=arrival&view=list'),
    })

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.filters.query).toBe('arrival')
    expect(result.current.filters.view).toBe('list')
    expect(result.current.results.map((movie) => movie.movieId)).toEqual([4])
  })

  it('loads additional results without mutating the catalog', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ movies: catalog })))
    const originalTitles = catalog.map((movie) => movie.title)
    const { result } = renderHook(() => useMovieFilters(2), { wrapper: wrapper() })

    await waitFor(() => expect(result.current.status).toBe('ready'))
    act(() => result.current.loadMore())

    expect(result.current.results).toHaveLength(4)
    expect(catalog.map((movie) => movie.title)).toEqual(originalTitles)
  })
})

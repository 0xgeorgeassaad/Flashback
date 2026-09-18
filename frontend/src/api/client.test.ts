import { describe, expect, it, vi } from 'vitest'
import { fetchMovies, fetchRecommendations } from './client'
import type { Movie, SelectedMoviePayload } from '../types'

vi.mock('../lib/supabase', () => ({
  getAccessToken: vi.fn().mockResolvedValue('test-access-token'),
}))

const movie: Movie = {
  movieId: 1,
  title: 'Toy Story (1995)',
  genres: ['Animation', 'Comedy'],
  tmdbId: 862,
  posterPath: '/poster.jpg',
}

const selection: SelectedMoviePayload[] = Array.from({ length: 5 }, (_, index) => ({
  movieId: index + 1,
  rating: 5,
}))

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('API client', () => {
  it('returns a validated movie catalog', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ movies: [movie] }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchMovies()).resolves.toEqual([movie])
    expect(fetchMock).toHaveBeenCalledWith(
      'https://flashback.fastapicloud.dev/movies',
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
    expect(fetchMock.mock.calls[0][1].headers.get('Authorization')).toBe(
      'Bearer test-access-token',
    )
  })

  it('reports catalog HTTP errors using the backend detail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ detail: 'Catalog is unavailable.' }, 503)),
    )

    await expect(fetchMovies()).rejects.toThrow('Catalog is unavailable.')
  })

  it('rejects malformed catalog responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ movies: null })))

    await expect(fetchMovies()).rejects.toThrow('invalid movie data')
  })

  it('reports recommendation network failures without erasing the request contract', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network error')))

    await expect(fetchRecommendations(selection)).rejects.toThrow(
      'The recommendation service could not be reached.',
    )
  })

  it('requires at least five selected movies before sending a request', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchRecommendations(selection.slice(0, 4))).rejects.toThrow(
      'Please select at least 5 movies.',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

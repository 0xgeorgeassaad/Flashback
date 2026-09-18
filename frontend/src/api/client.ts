import { MIN_SELECTED_MOVIES } from '../constants'
import {
  isMovieArray,
  isRecommendationArray,
  isRecommendationSession,
  isRecommendationSessionArray,
  isSavedMovie,
  isSavedMovieArray,
} from '../lib/guards'
import { getAccessToken } from '../lib/supabase'
import type {
  Movie,
  Recommendation,
  RecommendationSession,
  SavedMovie,
  SelectedMoviePayload,
} from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'https://flashback.fastapicloud.dev'

function apiErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload !== 'object' || payload === null || !('detail' in payload)) return fallback

  const detail = payload.detail
  if (typeof detail === 'string') return detail

  if (
    typeof detail === 'object' &&
    detail !== null &&
    'message' in detail &&
    typeof detail.message === 'string'
  ) {
    return detail.message
  }

  return fallback
}

async function authenticatedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const accessToken = await getAccessToken()
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)
  return fetch(`${API_URL}${path}`, { ...init, headers })
}

async function readJson(response: Response, fallback: string): Promise<unknown> {
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    if (!response.ok) throw new Error(`${fallback} (${response.status}).`)
    throw new Error('The server returned unreadable data. Try again.')
  }
  if (!response.ok) throw new Error(apiErrorMessage(payload, `${fallback} (${response.status}).`))
  return payload
}

/**
 * Load the movie catalog.
 *
 * No TMDB API key is needed; posterPath values in the API response
 * are enough to build image URLs in the UI.
 */
export async function fetchMovies(): Promise<Movie[]> {
  let response: Response

  try {
    response = await authenticatedFetch('/movies')
  } catch {
    throw new Error('The movie catalog could not be reached. Check your connection and try again.')
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    if (!response.ok) {
      throw new Error(`The movie catalog returned an error (${response.status}).`)
    }

    throw new Error('The movie catalog returned unreadable data. Try again.')
  }

  if (!response.ok) {
    throw new Error(
      apiErrorMessage(payload, `The movie catalog returned an error (${response.status}).`),
    )
  }

  const movies =
    typeof payload === 'object' && payload !== null && 'movies' in payload
      ? payload.movies
      : undefined

  if (!isMovieArray(movies)) {
    throw new Error('The movie catalog returned invalid movie data. Try again.')
  }

  return movies
}

/**
 * Ask the backend for 5 recommendations.
 *
 * The calling hook owns loading, retry, and reset state.
 */
export async function fetchRecommendations(
  selected: SelectedMoviePayload[],
): Promise<Recommendation[]> {
  if (selected.length < MIN_SELECTED_MOVIES) {
    throw new Error('Please select at least 5 movies.')
  }

  let response: Response

  try {
    response = await authenticatedFetch('/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movies: selected }),
    })
  } catch {
    throw new Error(
      'The recommendation service could not be reached. Check your connection and try again.',
    )
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    if (!response.ok) {
      throw new Error(`The recommendation service returned an error (${response.status}).`)
    }

    throw new Error('The recommendation service returned unreadable data. Try again.')
  }

  if (!response.ok) {
    throw new Error(
      apiErrorMessage(
        payload,
        `The recommendation service returned an error (${response.status}).`,
      ),
    )
  }

  const recommendations =
    typeof payload === 'object' && payload !== null && 'recommendations' in payload
      ? payload.recommendations
      : undefined

  if (!isRecommendationArray(recommendations)) {
    throw new Error('The recommendation service returned invalid movie data. Try again.')
  }

  if (recommendations.length !== 5) {
    throw new Error(
      `The recommendation service returned ${recommendations.length} results instead of 5. Try again.`,
    )
  }

  return recommendations
}

export async function fetchTasteSelection(): Promise<Movie[]> {
  const response = await authenticatedFetch('/me/selections')
  const payload = await readJson(response, 'Your taste reel could not be loaded')
  const movies =
    typeof payload === 'object' && payload !== null && 'movies' in payload
      ? payload.movies
      : undefined
  if (!isMovieArray(movies)) throw new Error('The server returned invalid taste reel data.')
  return movies
}

export async function updateTasteSelection(movies: Movie[]): Promise<Movie[]> {
  const response = await authenticatedFetch('/me/selections', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movieIds: movies.map((movie) => movie.movieId) }),
  })
  const payload = await readJson(response, 'Your taste reel could not be saved')
  const saved =
    typeof payload === 'object' && payload !== null && 'movies' in payload
      ? payload.movies
      : undefined
  if (!isMovieArray(saved)) throw new Error('The server returned invalid taste reel data.')
  return saved
}

export async function fetchSavedMovies(): Promise<SavedMovie[]> {
  const response = await authenticatedFetch('/me/saved-movies')
  const payload = await readJson(response, 'Your saved movies could not be loaded')
  const movies =
    typeof payload === 'object' && payload !== null && 'movies' in payload
      ? payload.movies
      : undefined
  if (!isSavedMovieArray(movies)) throw new Error('The server returned invalid saved movie data.')
  return movies
}

export async function createSavedMovie(movieId: number): Promise<SavedMovie> {
  const response = await authenticatedFetch('/me/saved-movies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movieId }),
  })
  const payload = await readJson(response, 'The movie could not be saved')
  if (!isSavedMovie(payload)) throw new Error('The server returned invalid saved movie data.')
  return payload
}

export async function setSavedMovieWatched(
  movieId: number,
  watched: boolean,
): Promise<SavedMovie> {
  const response = await authenticatedFetch(`/me/saved-movies/${movieId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ watched }),
  })
  const payload = await readJson(response, 'The movie could not be updated')
  if (!isSavedMovie(payload)) throw new Error('The server returned invalid saved movie data.')
  return payload
}

export async function deleteSavedMovie(movieId: number): Promise<void> {
  const response = await authenticatedFetch(`/me/saved-movies/${movieId}`, { method: 'DELETE' })
  if (!response.ok) {
    const payload = await readJson(response, 'The movie could not be removed')
    void payload
  }
}

export async function fetchRecommendationSessions(): Promise<RecommendationSession[]> {
  const response = await authenticatedFetch('/me/recommendation-sessions')
  const payload = await readJson(response, 'Your recommendation history could not be loaded')
  const sessions =
    typeof payload === 'object' && payload !== null && 'sessions' in payload
      ? payload.sessions
      : undefined
  if (!isRecommendationSessionArray(sessions)) {
    throw new Error('The server returned invalid recommendation history data.')
  }
  return sessions
}

export async function createRecommendationSession(
  session: RecommendationSession,
): Promise<RecommendationSession> {
  const response = await authenticatedFetch('/me/recommendation-sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  })
  const payload = await readJson(response, 'The recommendation reel could not be saved')
  if (!isRecommendationSession(payload)) {
    throw new Error('The server returned invalid recommendation history data.')
  }
  return payload
}

export async function deleteRecommendationSession(sessionId: string): Promise<void> {
  const response = await authenticatedFetch(
    `/me/recommendation-sessions/${encodeURIComponent(sessionId)}`,
    { method: 'DELETE' },
  )
  if (!response.ok) {
    const payload = await readJson(response, 'The recommendation reel could not be removed')
    void payload
  }
}

export async function clearAccountLibrary(): Promise<void> {
  const response = await authenticatedFetch('/me/library', { method: 'DELETE' })
  if (!response.ok) {
    const payload = await readJson(response, 'Your library could not be cleared')
    void payload
  }
}

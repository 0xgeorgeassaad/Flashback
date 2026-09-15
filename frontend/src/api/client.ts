import { MIN_SELECTED_MOVIES } from '../constants'
import { isMovieArray, isRecommendationArray } from '../lib/guards'
import type { Movie, Recommendation, SelectedMoviePayload } from '../types'

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

/**
 * Load the movie catalog.
 *
 * No TMDB API key is needed; posterPath values in the API response
 * are enough to build image URLs in the UI.
 */
export async function fetchMovies(): Promise<Movie[]> {
  let response: Response

  try {
    response = await fetch(`${API_URL}/movies`)
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
    response = await fetch(`${API_URL}/recommend`, {
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

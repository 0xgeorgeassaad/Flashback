import { MIN_SELECTED_MOVIES } from '../constants'
import type { Movie, Recommendation, SelectedMoviePayload } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'https://flashback.fastapicloud.dev'

/**
 * Load the movie catalog.
 *
 * No TMDB API key is needed; posterPath values in the API response
 * are enough to build image URLs in the UI.
 */
export async function fetchMovies(): Promise<Movie[]> {
  // TODO [Contributor 2]: handle non-OK responses and preserve a useful error cause.
  const response = await fetch(`${API_URL}/movies`)
  const data = (await response.json()) as { movies: Movie[] }
  return data.movies
}

/**
 * Ask the backend for 5 recommendations.
 *
 * Contributor 5 owns the request lifecycle and error handling for
 * the deployed POST /recommend endpoint.
 */
export async function fetchRecommendations(
  selected: SelectedMoviePayload[],
): Promise<Recommendation[]> {
  if (selected.length < MIN_SELECTED_MOVIES) {
    throw new Error('Please select at least 5 movies.')
  }

  // TODO [Contributor 5]: POST `${API_URL}/recommend` with body { movies: selected }
  // TODO [Contributor 5]: set Content-Type: application/json
  // TODO [Contributor 5]: distinguish non-OK, invalid JSON, and network failures for the UI
  throw new Error('Wire POST /recommend to the deployed backend.')
}

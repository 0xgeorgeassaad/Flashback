import type { Movie, Recommendation, RecommendationSession, SavedMovie } from '../types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

export function isMovie(value: unknown): value is Movie {
  if (!isRecord(value)) return false

  return (
    isInteger(value.movieId) &&
    typeof value.title === 'string' &&
    Array.isArray(value.genres) &&
    value.genres.every((genre) => typeof genre === 'string') &&
    (value.tmdbId === undefined || value.tmdbId === null || isInteger(value.tmdbId)) &&
    (value.posterPath === null || typeof value.posterPath === 'string')
  )
}

export function isRecommendation(value: unknown): value is Recommendation {
  if (!isRecord(value)) return false
  const record = value
  return isMovie(value) && typeof record.score === 'number' && Number.isFinite(record.score)
}

export function isSavedMovie(value: unknown): value is SavedMovie {
  if (!isRecord(value)) return false
  const record = value
  return (
    isMovie(value) &&
    typeof record.watched === 'boolean' &&
    isValidDate(record.savedAt)
  )
}

export function isRecommendationSession(value: unknown): value is RecommendationSession {
  if (!isRecord(value)) return false

  const selectedMoviesAreValid =
    value.selectedMovies === undefined ||
    (Array.isArray(value.selectedMovies) && value.selectedMovies.every(isMovie))

  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    isValidDate(value.createdAt) &&
    Array.isArray(value.selectedMovieIds) &&
    value.selectedMovieIds.every(isInteger) &&
    new Set(value.selectedMovieIds).size === value.selectedMovieIds.length &&
    selectedMoviesAreValid &&
    Array.isArray(value.recommendations) &&
    value.recommendations.every(isRecommendation)
  )
}

export function isMovieArray(value: unknown): value is Movie[] {
  return Array.isArray(value) && value.every(isMovie)
}

export function isSavedMovieArray(value: unknown): value is SavedMovie[] {
  return Array.isArray(value) && value.every(isSavedMovie)
}

export function isRecommendationArray(value: unknown): value is Recommendation[] {
  return Array.isArray(value) && value.every(isRecommendation)
}

export function isRecommendationSessionArray(value: unknown): value is RecommendationSession[] {
  return Array.isArray(value) && value.every(isRecommendationSession)
}

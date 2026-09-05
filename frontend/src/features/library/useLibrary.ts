import type { RecommendationSession, SavedMovie } from '../../types'

export function useLibrary() {
  // TODO [Contributor 6]: build this on useLocalStorage and keep storage updates immutable and resilient.
  return {
    savedMovies: [] as SavedMovie[],
    history: [] as RecommendationSession[],
    saveMovie: (_movie: SavedMovie) => undefined,
    removeMovie: (_movieId: number) => undefined,
    toggleWatched: (_movieId: number) => undefined,
    saveSession: (_session: RecommendationSession) => undefined,
    removeSession: (_sessionId: string) => undefined,
  }
}

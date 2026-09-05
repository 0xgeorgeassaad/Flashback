import type { Recommendation } from '../../types'

type RecommendationState = {
  recommendations: Recommendation[]
  loading: boolean
  error: string | null
}

export function useRecommendations(): RecommendationState & {
  requestRecommendations: () => Promise<void>
  resetRecommendations: () => void
} {
  // TODO [Contributor 5]: validate picks, call fetchRecommendations, expose retry/reset, and pass completed sessions to Contributor 6's library API.
  return {
    recommendations: [],
    loading: false,
    error: null,
    requestRecommendations: async () => undefined,
    resetRecommendations: () => undefined,
  }
}

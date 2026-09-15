import { useCallback, useRef, useState } from 'react'
import { fetchRecommendations } from '../../api/client'
import type { Recommendation, SelectedMoviePayload } from '../../types'

export type RecommendationStatus = 'idle' | 'loading' | 'success' | 'error'

type RecommendationState = {
  recommendations: Recommendation[]
  status: RecommendationStatus
  error: string | null
}

export function useRecommendations(selected: SelectedMoviePayload[]) {
  const [state, setState] = useState<RecommendationState>({
    recommendations: [],
    status: 'idle',
    error: null,
  })
  const requestNumber = useRef(0)

  const requestRecommendations = useCallback(async () => {
    const currentRequest = requestNumber.current + 1
    requestNumber.current = currentRequest
    setState((current) => ({ ...current, status: 'loading', error: null }))

    try {
      const recommendations = await fetchRecommendations(selected)
      if (requestNumber.current !== currentRequest) return null

      setState({ recommendations, status: 'success', error: null })
      return recommendations
    } catch (error) {
      if (requestNumber.current !== currentRequest) return null

      setState({
        recommendations: [],
        status: 'error',
        error: error instanceof Error ? error.message : 'Recommendations could not be loaded.',
      })
      return null
    }
  }, [selected])

  const resetRecommendations = useCallback(() => {
    requestNumber.current += 1
    setState({ recommendations: [], status: 'idle', error: null })
  }, [])

  return {
    ...state,
    loading: state.status === 'loading',
    requestRecommendations,
    resetRecommendations,
  }
}

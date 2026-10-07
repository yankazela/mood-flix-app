import type { RecommendationRequest, RecommendationResponse } from '@/lib/types'
import type { RecommendationContext } from '@/lib/recommendation/engine'

/**
 * Client-side recommendation service.
 *
 * Talks to `POST /api/recommendations`. The route handler owns the engine
 * (and later: the AI + TMDB calls and their API keys), so nothing secret ever
 * reaches the browser bundle.
 */
export interface RecommendationService {
  getRecommendations(request: RecommendationRequest, context?: RecommendationContext): Promise<RecommendationResponse>
}

export interface RecommendationApiPayload extends RecommendationRequest {
  context?: RecommendationContext
}

export class RecommendationError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'RecommendationError'
    this.status = status
  }
}

class ApiRecommendationService implements RecommendationService {
  async getRecommendations(request: RecommendationRequest, context?: RecommendationContext): Promise<RecommendationResponse> {
    const payload: RecommendationApiPayload = { ...request, context }
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null
      throw new RecommendationError(body?.error ?? 'We couldn’t load recommendations right now.', response.status)
    }
    return (await response.json()) as RecommendationResponse
  }
}

export const recommendationService: RecommendationService = new ApiRecommendationService()

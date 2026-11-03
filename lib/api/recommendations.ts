import { t } from '@/lib/i18n'
import { PLAN_LIMITS } from '@/lib/billing/config'
import type { FeedbackRating, HistoryEntry, Movie, Plan, RecommendationRequest, RecommendationResponse, StreamingProviderId } from '@/lib/types'
import type { ApiHistoryEntry, ApiRecommendationResult } from '@/lib/api/types'
import { ApiError } from '@/app/api/requests'
import { apiGet, apiPatch, apiPost } from '@/lib/api/client'
import { buildRecommendBody, toHistoryEntry, toRecommendationResponse } from '@/lib/api/adapters'

export type RecommendationErrorKind = 'safety' | 'rate-limit' | 'unavailable' | 'invalid' | 'generic'

/** What a 429 says besides its message: which plan hit which cap, and when the counter restarts. */
export interface RateLimitDetails {
  plan: Plan
  limit: number
  used: number
  resetsAt: string
}

export class RecommendationError extends Error {
  kind: RecommendationErrorKind
  status?: number
  rateLimit?: RateLimitDetails

  constructor(message: string, kind: RecommendationErrorKind, status?: number, rateLimit?: RateLimitDetails) {
    super(message)
    this.name = 'RecommendationError'
    this.kind = kind
    this.status = status
    this.rateLimit = rateLimit
  }
}

function rateLimitDetails(data: unknown): RateLimitDetails | undefined {
  const body = data as Partial<Record<'plan' | 'limit' | 'used' | 'resetsAt', unknown>> | null
  if (!body || typeof body !== 'object' || typeof body.limit !== 'number' || typeof body.resetsAt !== 'string') return undefined
  return {
    plan: body.plan === 'advanced' ? 'advanced' : 'free',
    limit: body.limit,
    used: typeof body.used === 'number' ? body.used : body.limit,
    resetsAt: body.resetsAt,
  }
}

function toRecommendationError(error: unknown): RecommendationError {
  if (error instanceof RecommendationError) return error
  const status = error instanceof ApiError ? error.status : undefined
  const message = error instanceof Error && error.message ? error.message : t('api.loadFailed')
  // The server's message is the person-facing text for these: the supportive note, the daily limit, what to fix.
  if (status === 422) return new RecommendationError(message, 'safety', status)
  if (status === 429) {
    const details = error instanceof ApiError ? rateLimitDetails(error.data) : undefined
    // The server's English sentence is replaced by one in the interface language, built from the same facts.
    const localized = details
      ? details.plan === 'free'
        ? t('api.dailyLimitFree', { limit: details.limit, advanced: PLAN_LIMITS.advanced })
        : t('api.dailyLimitPaid', { limit: details.limit })
      : message
    return new RecommendationError(localized, 'rate-limit', status, details)
  }
  if (status === 400 || status === 404) return new RecommendationError(message, 'invalid', status)
  if (status === 503) return new RecommendationError(t('api.warming'), 'unavailable', status)
  if (status === undefined || status >= 500) return new RecommendationError(t('api.loadFailedRetry'), 'generic', status)
  return new RecommendationError(message, 'generic', status)
}

/** Recommendations take a few model calls; allow longer than the default request timeout. */
const RECOMMEND_TIMEOUT_MS = 40_000

export async function requestRecommendations(
  request: RecommendationRequest,
  preferredServices: StreamingProviderId[],
): Promise<RecommendationResponse> {
  try {
    const result = await apiPost<ApiRecommendationResult>('/recommendations', buildRecommendBody(request), RECOMMEND_TIMEOUT_MS)
    return toRecommendationResponse(result, request.objective, preferredServices)
  } catch (error) {
    throw toRecommendationError(error)
  }
}

export async function fetchHistory(limit = 30): Promise<{ entries: HistoryEntry[]; movies: Movie[] }> {
  const { entries } = await apiGet<{ entries: ApiHistoryEntry[] }>('/recommendations/history', { limit })
  const converted = entries.map(toHistoryEntry)
  return { entries: converted.map((item) => item.entry), movies: converted.flatMap((item) => item.movies) }
}

export interface RequestOutcome {
  selectedItemId?: string
  feedback?: FeedbackRating
}

/** Records the title the user chose and/or how a request's results went. */
export async function recordOutcome(requestId: string, outcome: RequestOutcome): Promise<void> {
  await apiPatch(`/recommendations/${encodeURIComponent(requestId)}`, outcome)
}

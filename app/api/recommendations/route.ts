import { NextResponse } from 'next/server'
import type { RecommendationRequest } from '@/lib/types'
import type { RecommendationApiPayload } from '@/lib/services/recommendationService'
import { recommend } from '@/lib/recommendation/engine'
import { MOVIES } from '@/lib/data/movies'
import { USER_MOODS } from '@/lib/data/moods'
import { STREAMING_PROVIDERS } from '@/lib/data/providers'
import { WORLD_COUNTRIES } from '@/lib/data/world-countries'
import { CONTENT_RATINGS } from '@/lib/data/content-ratings'
import { GENRE_OPTIONS } from '@/lib/data/genres'

/**
 * POST /api/recommendations
 *
 * Request body:  RecommendationRequest (+ optional `context`)
 * Response body: RecommendationResponse
 *
 * Future wiring (all server-side, keys via process.env):
 *   1. Send `prompt` + `moods` to the AI API → MoodInterpretation.
 *   2. Query TMDB discover + watch providers for `country`.
 *   3. Score, rank and explain → same response shape as today.
 */

const VALID_MOODS = new Set(USER_MOODS.map((mood) => mood.id))
const VALID_PROVIDERS = new Set(STREAMING_PROVIDERS.map((provider) => provider.id))
const VALID_COUNTRIES = new Set(WORLD_COUNTRIES.map((country) => country.code))
const VALID_GENRES = new Set(GENRE_OPTIONS.map((genre) => genre.id))
const VALID_RATINGS = new Set(CONTENT_RATINGS.map((rating) => rating.id))

function validate(body: unknown): { request: RecommendationRequest; context?: RecommendationApiPayload['context'] } | string {
  if (!body || typeof body !== 'object') return 'Request body must be a JSON object.'
  const payload = body as Partial<RecommendationApiPayload>

  const prompt = typeof payload.prompt === 'string' ? payload.prompt.slice(0, 1000) : ''
  const moods = Array.isArray(payload.moods) ? payload.moods.filter((mood) => VALID_MOODS.has(mood)) : []
  if (!prompt.trim() && moods.length === 0) return 'Tell us how you feel: add a prompt or pick at least one mood.'

  const streamingProviders = Array.isArray(payload.streamingProviders)
    ? payload.streamingProviders.filter((id) => VALID_PROVIDERS.has(id))
    : []
  const country = payload.country && VALID_COUNTRIES.has(payload.country) ? payload.country : 'CA'
  const favouriteGenres = Array.isArray(payload.favouriteGenres) ? payload.favouriteGenres.filter((genre) => VALID_GENRES.has(genre)) : []
  const maxContentRating = payload.maxContentRating && VALID_RATINGS.has(payload.maxContentRating) ? payload.maxContentRating : undefined

  return {
    request: { prompt, moods, streamingProviders, country, favouriteGenres, maxContentRating, filters: payload.filters },
    context: payload.context,
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const validated = validate(body)
  if (typeof validated === 'string') {
    return NextResponse.json({ error: validated }, { status: 400 })
  }

  // Simulated inference latency so the loading experience is visible.
  await new Promise((resolve) => setTimeout(resolve, 900))

  const response = recommend(validated.request, MOVIES, validated.context)
  return NextResponse.json(response)
}

import type {
  DiscoveryFilters,
  FeedbackRating,
  HistoryEntry,
  Movie,
  MoodInterpretation,
  MoodObjective,
  Recommendation,
  RecommendationRequest,
  RecommendationResponse,
  StreamingProviderId,
  UserMoodId,
} from '@/lib/types'
import type { ApiHistoryEntry, ApiItem, ApiMediaType, ApiMoodProfile, ApiRecommendBody, ApiRecommendationResult, ApiTarget } from '@/lib/api/types'
import { posterUrlFor } from '@/lib/api/config'
import { isMoodId, getMood } from '@/lib/data/moods'
import { isOnMyServices, orderServices, serviceForSlug } from '@/lib/data/providers'
import { formatRuntime, joinNatural } from '@/lib/format'

/** An API catalogue item as the app's `Movie`. Fields the catalogue does not have yet come back empty. */
export function toMovie(item: ApiItem): Movie {
  const details = item.details ?? {}
  const score = typeof details.voteAverage === 'number' && details.voteAverage > 0 ? Math.round(details.voteAverage * 10) / 10 : null

  return {
    id: item.itemId,
    mediaType: item.mediaType === 'series' || details.kind === 'show' ? 'tv' : 'movie',
    title: item.title,
    tagline: details.tagline,
    overview: details.overview ?? '',
    releaseYear: item.year ?? null,
    runtimeMinutes: item.runtime ?? null,
    rating: score,
    voteCount: details.voteCount ?? 0,
    contentRating: item.rating ?? null,
    genres: item.genres ?? [],
    posterUrl: posterUrlFor(item.posterKey),
    backdropUrl: null,
    director: details.director ?? null,
    cast: details.cast ?? [],
    language: details.originalLanguage ?? null,
    services: orderServices((item.availability?.services ?? []).map((slug) => serviceForSlug(slug, item.title))),
    watchUrl: item.availability?.links?.tmdb ?? null,
    seasons: details.seasonCount,
    episodes: details.episodeCount,
    popularity: item.popularity ?? 0,
  }
}

function highlightsFor(movie: Movie, preferred: StreamingProviderId[]): string[] {
  const highlights: string[] = []
  const service = orderServices(movie.services, preferred)[0]
  if (service) highlights.push(isOnMyServices(movie.services, preferred) ? `On ${service.name}, which you have` : `On ${service.name}`)
  if (movie.mediaType === 'tv') {
    if (movie.seasons) highlights.push(`${movie.seasons} season${movie.seasons === 1 ? '' : 's'}`)
  } else if (movie.runtimeMinutes && movie.runtimeMinutes <= 120) {
    highlights.push(movie.runtimeMinutes <= 95 ? `Short: ${formatRuntime(movie.runtimeMinutes)}` : 'Under 2 hours')
  }
  if (movie.rating && movie.rating >= 7.5) highlights.push(`Rated ${movie.rating.toFixed(1)}/10`)
  return highlights
}

function toRecommendation(item: ApiItem, preferred: StreamingProviderId[]): Recommendation {
  const movie = toMovie(item)
  return {
    movie,
    matchScore: Math.round(item.matchScore ?? 0),
    reason: item.why?.trim() || `A good fit for how you’re feeling right now.`,
    highlights: highlightsFor(movie, preferred),
  }
}

export function toInterpretation(profile: ApiMoodProfile, target: ApiTarget, objective: MoodObjective): MoodInterpretation {
  const themes = target.themes_seek.length > 0 ? target.themes_seek : profile.themes_seek
  return {
    emotion: profile.primary_emotion,
    themes,
    objective,
    summary: themes.length > 0 ? joinNatural(themes.slice(0, 3)) : 'something that fits the moment',
  }
}

/** How many results get the "Top picks" treatment; the rest go in a row beneath. */
export const TOP_PICKS = 3

export function toRecommendationResponse(
  result: ApiRecommendationResult,
  objective: MoodObjective,
  preferredServices: StreamingProviderId[],
  createdAt: string = new Date().toISOString(),
): RecommendationResponse {
  const recommendations = result.results.map((item) => toRecommendation(item, preferredServices))
  const rest = recommendations.slice(TOP_PICKS)
  return {
    id: result.requestId,
    createdAt,
    interpretation: toInterpretation(result.moodProfile, result.target, objective),
    recommendations,
    sections:
      rest.length > 0
        ? [{ id: 'more-for-mood', title: 'More for your mood', subtitle: 'Other titles that fit how you feel right now.', layout: 'row', recommendations: rest }]
        : [],
    notice: result.notice,
    usage: result.usage,
  }
}

/** A past request as a history entry, plus the titles it returned so the page can show them. */
export function toHistoryEntry(entry: ApiHistoryEntry): { entry: HistoryEntry; movies: Movie[] } {
  const movies = entry.results.map(toMovie)
  return {
    movies,
    entry: {
      id: entry.requestId,
      createdAt: entry.requestedAt,
      prompt: entry.text,
      moods: (entry.moods ?? []).filter(isMoodId),
      interpretation: toInterpretation(entry.moodProfile, entry.target, entry.objective),
      recommendedMovieIds: movies.map((movie) => movie.id),
      selectedMovieId: entry.selectedItemId,
      feedback: entry.feedback as FeedbackRating | undefined,
    },
  }
}

const MAX_TEXT = 500

function textFor(prompt: string, moods: UserMoodId[]): string {
  const typed = prompt.trim()
  if (typed.length >= 3) return typed.slice(0, MAX_TEXT)
  if (typed) return `${typed} movie`
  return `I’m feeling ${joinNatural(moods.map((id) => getMood(id).phrase ?? getMood(id).label.toLowerCase()))}`.slice(0, MAX_TEXT)
}

function mediaTypesFor(filters: DiscoveryFilters | undefined): ApiMediaType[] | undefined {
  if (filters?.mediaType === 'movie') return ['movie', 'documentary']
  if (filters?.mediaType === 'tv') return ['series']
  return undefined
}

export function buildRecommendBody(request: RecommendationRequest): ApiRecommendBody {
  const { filters } = request
  const body: ApiRecommendBody = {
    text: textFor(request.prompt, request.moods),
    objective: request.objective,
    mediaTypes: mediaTypesFor(filters),
    moods: request.moods.length > 0 ? request.moods : undefined,
    services: filters?.providers?.length ? filters.providers : undefined,
    maxRuntimeMin: filters?.maxRuntime,
    genres: filters?.genres?.length ? filters.genres : undefined,
    releaseYearMin: filters?.releaseYearMin,
    minRating: filters?.minRating,
    language: filters?.language && filters.language !== 'any' ? filters.language : undefined,
  }
  return Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined)) as unknown as ApiRecommendBody
}

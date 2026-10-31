/** Shapes the MoodFlix API sends and accepts. They mirror the backend's domain types. */

export type ApiMediaType = 'movie' | 'series' | 'documentary' | 'music' | 'book'
export type ApiFeedback = 'perfect' | 'good' | 'okay' | 'not-for-me'
export type ApiObjective = 'keep' | 'improve'

export interface ApiAvailability {
  /** Provider slugs the title streams on in the user's country, e.g. "netflix". */
  services: string[]
  links?: Record<string, string>
  checkedAt: string
}

export interface ApiItemDetails {
  kind?: 'film' | 'show'
  voteCount?: number
  /** Audience score, 0–10. */
  voteAverage?: number
  episodeCount?: number
  seasonCount?: number
  overview?: string
  tagline?: string
  originalLanguage?: string
  director?: string
  cast?: { name: string; character?: string }[]
}

export interface ApiItem {
  itemId: string
  mediaType: ApiMediaType
  title: string
  year?: number
  runtime?: number
  genres: string[]
  /** Path under the posters bucket, e.g. "posters/tmdb-movie-508442.jpg". */
  posterKey?: string
  availability?: ApiAvailability
  details?: ApiItemDetails
  /** One-line, model-written reason the title fits the request. */
  why?: string
  /** Certification in the user's country. */
  rating?: string
  popularity?: number
  /** 0–100; only present on recommendation results. */
  matchScore?: number
}

export interface ApiMoodProfile {
  primary_emotion: string
  valence: number
  arousal: number
  themes_seek: string[]
  themes_avoid: string[]
  constraints: { max_runtime_min?: number }
  confidence: number
  safety_flag: boolean
  supportive_message?: string
}

export interface ApiTarget {
  valence: number
  arousal: number
  themes_seek: string[]
}

export interface ApiUsage {
  plan: 'free' | 'advanced'
  used: number
  limit: number
  remaining: number
  resetsAt: string
}

export interface ApiRecommendationResult {
  requestId: string
  moodProfile: ApiMoodProfile
  target: ApiTarget
  results: ApiItem[]
  notice?: 'few_matches'
  latencyMs: number
  usage?: ApiUsage
}

export interface ApiRequestFilters {
  maxRuntimeMin?: number
  genres?: string[]
  releaseYearMin?: number
  minRating?: number
  language?: string
}

export interface ApiHistoryEntry {
  requestId: string
  requestedAt: string
  text: string
  objective: ApiObjective
  moods?: string[]
  filters?: ApiRequestFilters
  moodProfile: ApiMoodProfile
  target: ApiTarget
  results: ApiItem[]
  selectedItemId?: string
  feedback?: ApiFeedback
}

export interface ApiVote {
  vote: 'up' | 'down'
  requestId?: string
  at: string
}

/** Body of POST /recommendations. */
export interface ApiRecommendBody {
  text: string
  objective: ApiObjective
  inputType?: 'text' | 'voice'
  mediaTypes?: ApiMediaType[]
  moods?: string[]
  services?: string[]
  maxRuntimeMin?: number
  genres?: string[]
  releaseYearMin?: number
  minRating?: number
  language?: string
}

/** Library-related fields of PATCH /user. */
export interface ApiLibraryPatch {
  myMovies?: string[]
  watched?: string[]
  ratings?: Record<string, ApiFeedback>
  votes?: Record<string, { vote: 'up' | 'down'; requestId?: string }>
  removeVotes?: string[]
}

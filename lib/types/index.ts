/**
 * Core domain types for MoodFlix.
 *
 * These mirror the shape of the future backend contract so that the mocked
 * services can be swapped for TMDB / AI / backend calls without touching UI.
 */

// ---------------------------------------------------------------------------
// Catalog primitives
// ---------------------------------------------------------------------------

export type MovieGenre =
  | 'action'
  | 'adventure'
  | 'animation'
  | 'comedy'
  | 'crime'
  | 'drama'
  | 'family'
  | 'fantasy'
  | 'history'
  | 'horror'
  | 'music'
  | 'mystery'
  | 'romance'
  | 'science-fiction'
  | 'thriller'
  | 'war'

export type MediaType = 'movie' | 'tv'

/** MPAA-style content rating, ordered from gentlest to most mature. */
export type ContentRating = 'G' | 'PG' | 'PG-13' | 'R'

export type StreamingProviderId =
  | 'netflix'
  | 'prime'
  | 'disney'
  | 'apple'
  | 'paramount'
  | 'crave'
  | 'max'

export type CountryCode = string

export interface Country {
  code: CountryCode
  name: string
  flag: string
}

export interface StreamingProvider {
  id: StreamingProviderId
  name: string
  shortName: string
  /** Brand colour used for badges and selectable cards. */
  brandColor: string
  /** Foreground colour that reads well on top of `brandColor`. */
  textColor: string
  /** Countries where the service operates. */
  countries: CountryCode[]
}

export type AvailabilityType = 'subscription' | 'rent' | 'buy'

export interface MovieAvailability {
  providerId: StreamingProviderId
  countries: CountryCode[]
  type: AvailabilityType
}

export interface CastMember {
  name: string
  character: string
}

/**
 * Six-axis emotional fingerprint. Every value is 0–100.
 * Used both to describe movies and to describe what a user is looking for.
 */
export interface EmotionalProfile {
  funny: number
  comforting: number
  exciting: number
  dark: number
  romantic: number
  intensity: number
}

export type EmotionalAxis = keyof EmotionalProfile

export interface Movie {
  id: string
  tmdbId: number
  mediaType: MediaType
  title: string
  tagline?: string
  overview: string
  releaseYear: number
  runtimeMinutes: number
  /** TMDB-style rating, 0–10. */
  rating: number
  voteCount: number
  contentRating: ContentRating
  genres: MovieGenre[]
  /** TMDB poster path, e.g. "/abc123.jpg". Resolved via `lib/tmdb`. */
  posterPath: string
  /** TMDB backdrop path. Null falls back to a blurred poster. */
  backdropPath: string | null
  director: string
  cast: CastMember[]
  /** ISO 639-1 original language code. */
  language: string
  availability: MovieAvailability[]
  emotionalProfile: EmotionalProfile
  /** Free-form descriptors used by the recommendation engine. */
  tags: string[]
  /** 0–100 relative popularity, used for "Popular tonight". */
  popularity: number
}

// ---------------------------------------------------------------------------
// Mood & discovery
// ---------------------------------------------------------------------------

export type UserMoodId =
  | 'stressed'
  | 'tired'
  | 'sad'
  | 'happy'
  | 'bored'
  | 'romantic'
  | 'excited'
  | 'relax'

export interface UserMood {
  id: UserMoodId
  label: string
  emoji: string
  /** What someone in this mood usually wants to feel. */
  desired: Partial<EmotionalProfile>
  /** Words used to describe this mood in generated copy. */
  descriptors: string[]
}

export interface DiscoveryFilters {
  maxRuntime?: number
  mediaType?: MediaType | 'all'
  genres?: MovieGenre[]
  releaseYearMin?: number
  minRating?: number
  providers?: StreamingProviderId[]
  language?: string
}

// ---------------------------------------------------------------------------
// Recommendation contract (POST /api/recommendations)
// ---------------------------------------------------------------------------

export interface RecommendationRequest {
  prompt: string
  moods: UserMoodId[]
  streamingProviders: StreamingProviderId[]
  country: CountryCode
  /** Standing taste preferences captured at onboarding. */
  favouriteGenres?: MovieGenre[]
  maxContentRating?: ContentRating
  filters?: DiscoveryFilters
}

export type IntensityLevel = 'low' | 'medium' | 'high'

export interface MoodInterpretation {
  currentMood: string[]
  desiredMood: string[]
  intensity: IntensityLevel
  cognitiveLoad: IntensityLevel
  /** Human-readable summary used for subtitles, e.g. "something relaxing, funny and easy to watch". */
  summary: string
  /** Target emotional fingerprint the engine scores against. */
  targetProfile: EmotionalProfile
  /** Keywords extracted from the natural-language prompt. */
  keywords: string[]
}

export interface Recommendation {
  movie: Movie
  /** 0–100 match percentage. */
  matchScore: number
  /** "Why we picked this for you" copy. */
  reason: string
  /** Short bullet highlights, e.g. "Under 2 hours", "On Netflix". */
  highlights: string[]
}

export type SectionLayout = 'grid' | 'row'

export interface RecommendationSection {
  id: string
  title: string
  subtitle?: string
  layout: SectionLayout
  recommendations: Recommendation[]
}

export interface RecommendationResponse {
  id: string
  createdAt: string
  interpretation: MoodInterpretation
  /** Ordered list; the first three are the "Top picks". */
  recommendations: Recommendation[]
  /** Additional catalog sections shown after the top picks. */
  sections: RecommendationSection[]
}

// ---------------------------------------------------------------------------
// User, preferences, feedback, history
// ---------------------------------------------------------------------------

export type AuthProviderKind = 'password' | 'google'

export interface User {
  id: string
  name: string
  email: string
  country?: CountryCode
  avatarUrl?: string
  authProvider: AuthProviderKind
  createdAt: string
}

export interface UserPreference {
  streamingProviders: StreamingProviderId[]
  country: CountryCode
  language: string
  /** Genres the user told us they enjoy during onboarding. */
  favouriteGenres: MovieGenre[]
  /** The most mature content rating the user is comfortable with. */
  maxContentRating: ContentRating
  onboardingCompleted: boolean
}

export type FeedbackRating = 'perfect' | 'good' | 'okay' | 'not-for-me'

export interface MovieFeedback {
  movieId: string
  rating?: FeedbackRating
  /** true = liked, false = disliked, undefined = no signal. */
  liked?: boolean
  watched: boolean
  saved: boolean
  recommendationId?: string
  updatedAt: string
}

export interface HistoryEntry {
  id: string
  createdAt: string
  prompt: string
  moods: UserMoodId[]
  interpretation: MoodInterpretation
  recommendedMovieIds: string[]
  selectedMovieId?: string
  feedback?: FeedbackRating
}

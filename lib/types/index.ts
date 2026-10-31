/**
 * Core domain types for MoodFlix.
 *
 * `Movie` is the app's view of a catalogue item; lib/api/adapters.ts builds it
 * from the MoodFlix API's item shape (lib/api/types.ts).
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

/** MPAA-style content rating the user picks as their ceiling, ordered from gentlest to most mature. */
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

export type Plan = 'free' | 'advanced'
export type PlanSource = 'apple' | 'google' | 'stripe' | 'promotional' | 'other'

/** Where the person stands against today's request cap, as the API reports it. */
export interface Usage {
  plan: Plan
  used: number
  limit: number
  remaining: number
  /** ISO 8601: when the counter restarts (UTC midnight). */
  resetsAt: string
}

/** A country by code and name. Its flag is drawn by `<Flag code />` from flag-icons, never stored as text. */
export interface Country {
  code: CountryCode
  name: string
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
  /** The catalogue's provider slugs for this service. */
  slugs: string[]
  /** The service's own search page; `{title}` is replaced with the URL-encoded title. */
  searchUrl: string
}

/** A streaming service a title is on, as the catalogue names it. */
export interface ServiceRef {
  /** The catalogue's provider slug, e.g. "amazon-prime-video". */
  slug: string
  name: string
  /** Set when the app knows the service (it can be picked at onboarding). */
  providerId?: StreamingProviderId
  /** Where to search for the title on this service. */
  url?: string
}

export interface CastMember {
  name: string
  character?: string
}

export interface Movie {
  /** The backend item id, e.g. "movie:tmdb-movie:508442". */
  id: string
  mediaType: MediaType
  title: string
  tagline?: string
  overview: string
  releaseYear: number | null
  /** A film's runtime, or a series' typical episode length. */
  runtimeMinutes: number | null
  /** Audience score, 0–10. Null when the catalogue has none. */
  rating: number | null
  voteCount: number
  /** The content rating in the user's country, as certified there (e.g. "PG-13" or "16"). */
  contentRating: string | null
  /** Lower-case catalogue genre names, e.g. "science fiction". */
  genres: string[]
  posterUrl: string | null
  backdropUrl: string | null
  director: string | null
  cast: CastMember[]
  /** ISO 639-1 original language code. */
  language: string | null
  /** Where it streams in the user's country. */
  services: ServiceRef[]
  /** Fallback place to find where to watch when no known service has a link. */
  watchUrl: string | null
  seasons?: number
  episodes?: number
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
  /** How the mood reads after "I’m feeling", when it differs from the lower-cased label. */
  phrase?: string
  /** Illustration under public/, shown in the mood dropdown instead of the emoji. */
  image?: string
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
// Recommendation contract (POST /recommendations on the MoodFlix API)
// ---------------------------------------------------------------------------

/** Whether to match the mood the user is in, or lift it. */
export type MoodObjective = 'keep' | 'improve'

export type PromptInputType = 'text' | 'voice'

export interface RecommendationRequest {
  prompt: string
  moods: UserMoodId[]
  objective: MoodObjective
  filters?: DiscoveryFilters
  /** Whether the words were typed or spoken. Kept with the request on the server. */
  inputType?: PromptInputType
}

export interface MoodInterpretation {
  /** How the model read the user's feeling, e.g. "drained". */
  emotion: string
  /** Themes the recommendations are aimed at, e.g. ["warmth", "humour"]. */
  themes: string[]
  objective: MoodObjective
  /** Human-readable summary used for subtitles, e.g. "warmth, humour and friendship". */
  summary: string
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
  /** The backend request id; also the history entry id. */
  id: string
  createdAt: string
  interpretation: MoodInterpretation
  /** Ordered list; the first three are the "Top picks". */
  recommendations: Recommendation[]
  /** Additional catalog sections shown after the top picks. */
  sections: RecommendationSection[]
  /** Set when fewer titles than usual matched, even after relaxing constraints. */
  notice?: 'few_matches'
  /** Where the person stands against today's cap, counting this request. */
  usage?: Usage
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
}

export interface HistoryEntry {
  /** The backend request id. */
  id: string
  createdAt: string
  prompt: string
  moods: UserMoodId[]
  interpretation: MoodInterpretation
  recommendedMovieIds: string[]
  selectedMovieId?: string
  feedback?: FeedbackRating
}

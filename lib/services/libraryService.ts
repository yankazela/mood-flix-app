import type { FeedbackRating, HistoryEntry, Movie, MovieFeedback, UserMoodId, UserPreference } from '@/lib/types'
import { readJSON, writeJSON } from '@/lib/storage'
import { recommend } from '@/lib/recommendation/engine'
import { DEFAULT_COUNTRY } from '@/lib/data/countries'
import { DEFAULT_CONTENT_RATING } from '@/lib/data/content-ratings'
import { STREAMING_PROVIDERS } from '@/lib/data/providers'

/**
 * Per-user library: saved / liked / watched movies, feedback and the
 * recommendation history. Persisted in localStorage for the mock; the real
 * implementation will hit the backend and these functions keep their shape.
 */

export interface LibraryState {
  feedback: Record<string, MovieFeedback>
  history: HistoryEntry[]
}

export const EMPTY_LIBRARY: LibraryState = { feedback: {}, history: [] }

export const DEFAULT_PREFERENCES: UserPreference = {
  streamingProviders: [],
  country: DEFAULT_COUNTRY,
  language: 'en',
  favouriteGenres: [],
  maxContentRating: DEFAULT_CONTENT_RATING,
  onboardingCompleted: false,
}

export interface LibraryService {
  loadLibrary(userId: string): Promise<LibraryState>
  saveLibrary(userId: string, state: LibraryState): Promise<void>
  loadPreferences(userId: string, defaultCountry?: UserPreference['country'], defaultServices?: string[]): Promise<UserPreference>
  savePreferences(userId: string, preferences: UserPreference): Promise<void>
}

const libraryKey = (userId: string) => `library.${userId}`
const prefsKey = (userId: string) => `prefs.${userId}`

/** Accounts that come pre-populated so the demo tells a story from the first click. */
const SEEDED_USER_IDS = new Set(['user_demo'])

class LocalLibraryService implements LibraryService {
  constructor(private readonly catalog: Movie[]) {}

  async loadLibrary(userId: string): Promise<LibraryState> {
    const stored = readJSON<LibraryState | null>(libraryKey(userId), null)
    if (stored) return stored
    const seeded = SEEDED_USER_IDS.has(userId) ? buildSeedLibrary(this.catalog) : EMPTY_LIBRARY
    writeJSON(libraryKey(userId), seeded)
    return seeded
  }

  async saveLibrary(userId: string, state: LibraryState): Promise<void> {
    writeJSON(libraryKey(userId), state)
  }

  async loadPreferences(userId: string, defaultCountry?: UserPreference['country'], defaultServices: string[] = []): Promise<UserPreference> {
    const stored = readJSON<Partial<UserPreference> | null>(prefsKey(userId), null)
    // Merge so preferences saved before a field existed still load cleanly.
    if (stored) return { ...DEFAULT_PREFERENCES, ...(defaultCountry && { country: defaultCountry }), ...stored }
    const normalizedServices = new Set(defaultServices.map((service) => service.trim().toLowerCase()))
    const streamingProviders = STREAMING_PROVIDERS
      .filter((provider) => [provider.id, provider.name, provider.shortName].some((name) => normalizedServices.has(name.toLowerCase())))
      .map((provider) => provider.id)
    const seeded: UserPreference = SEEDED_USER_IDS.has(userId)
      ? {
          streamingProviders: ['netflix', 'prime', 'disney', 'crave'],
          country: 'CA',
          language: 'en',
          favouriteGenres: ['comedy', 'drama', 'thriller'],
          maxContentRating: 'R',
          onboardingCompleted: true,
        }
      : {
          ...DEFAULT_PREFERENCES,
          ...(defaultCountry && { country: defaultCountry }),
          streamingProviders,
        }
    writeJSON(prefsKey(userId), seeded)
    return seeded
  }

  async savePreferences(userId: string, preferences: UserPreference): Promise<void> {
    writeJSON(prefsKey(userId), preferences)
  }
}

// ---------------------------------------------------------------------------
// Seed data for the demo account
// ---------------------------------------------------------------------------

interface SeedRequest {
  daysAgo: number
  hour: number
  prompt: string
  moods: UserMoodId[]
  selectedIndex: number
  feedback: FeedbackRating
}

const SEED_REQUESTS: SeedRequest[] = [
  {
    daysAgo: 1,
    hour: 19,
    prompt: 'Stressed after work, wanted something funny',
    moods: ['stressed'],
    selectedIndex: 0,
    feedback: 'perfect',
  },
  {
    daysAgo: 4,
    hour: 22,
    prompt: 'Tired, wanted something easy and comforting',
    moods: ['tired', 'relax'],
    selectedIndex: 1,
    feedback: 'good',
  },
  {
    daysAgo: 9,
    hour: 21,
    prompt: 'Saturday night, wanted an exciting thriller',
    moods: ['excited'],
    selectedIndex: 0,
    feedback: 'okay',
  },
]

function daysAgoAt(days: number, hour: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, Math.floor(Math.random() * 50) + 5, 0, 0)
  return date.toISOString()
}

export function buildSeedLibrary(catalog: Movie[]): LibraryState {
  const feedback: Record<string, MovieFeedback> = {}
  const history: HistoryEntry[] = []

  const touch = (movieId: string, patch: Partial<MovieFeedback>, at: string) => {
    const existing = feedback[movieId] ?? { movieId, watched: false, saved: false, updatedAt: at }
    feedback[movieId] = { ...existing, ...patch, updatedAt: at }
  }

  for (const seed of SEED_REQUESTS) {
    const createdAt = daysAgoAt(seed.daysAgo, seed.hour)
    const response = recommend(
      {
        prompt: seed.prompt,
        moods: seed.moods,
        streamingProviders: ['netflix', 'prime', 'disney', 'crave'],
        country: 'CA',
        favouriteGenres: ['comedy', 'drama', 'thriller'],
        maxContentRating: 'R',
      },
      catalog,
    )
    const recommended = response.recommendations.slice(0, 6)
    const selected = recommended[seed.selectedIndex]?.movie
    history.push({
      id: `hist_seed_${seed.daysAgo}`,
      createdAt,
      prompt: seed.prompt,
      moods: seed.moods,
      interpretation: response.interpretation,
      recommendedMovieIds: recommended.map((rec) => rec.movie.id),
      selectedMovieId: selected?.id,
      feedback: seed.feedback,
    })
    if (selected) {
      touch(
        selected.id,
        {
          watched: true,
          rating: seed.feedback,
          liked: seed.feedback === 'perfect' || seed.feedback === 'good' ? true : undefined,
          recommendationId: response.id,
        },
        createdAt,
      )
    }
  }

  // A few extra saved / liked titles so "My Movies" feels lived-in.
  const pick = (id: string) => catalog.find((movie) => movie.id === id)?.id
  const saved = ['past-lives', 'dune', 'the-grand-budapest-hotel', 'spirited-away'].map(pick).filter(Boolean) as string[]
  const liked = ['paddington-2', 'knives-out', 'everything-everywhere-all-at-once'].map(pick).filter(Boolean) as string[]
  saved.forEach((id, index) => touch(id, { saved: true }, daysAgoAt(2 + index, 20)))
  liked.forEach((id, index) => touch(id, { liked: true, watched: true }, daysAgoAt(6 + index * 3, 21)))

  history.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return { feedback, history }
}

export function createLibraryService(catalog: Movie[]): LibraryService {
  return new LocalLibraryService(catalog)
}

'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ContentRating, CountryCode, MovieGenre, StreamingProviderId, UserPreference } from '@/lib/types'
import type { UserDetails } from '@/app/(auth)/signup/store/state'
import { readPendingSignup } from '@/lib/auth/pending-signup'
import { DEFAULT_COUNTRY } from '@/lib/data/countries'
import { CONTENT_RATINGS, DEFAULT_CONTENT_RATING } from '@/lib/data/content-ratings'
import { GENRE_MAP } from '@/lib/data/genres'
import { providerForSlug } from '@/lib/data/providers'
import { useAuth } from '@/lib/store/auth-context'

export interface PreferencesContextValue {
  preferences: UserPreference
  /** False until a signed-in user's profile is available. */
  ready: boolean
  setStreamingProviders: (ids: StreamingProviderId[]) => void
  toggleStreamingProvider: (id: StreamingProviderId) => void
  setCountry: (code: CountryCode) => void
  setFavouriteGenres: (genres: MovieGenre[]) => void
  toggleFavouriteGenre: (genre: MovieGenre) => void
  setMaxContentRating: (rating: ContentRating) => void
  completeOnboarding: () => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export const DEFAULT_PREFERENCES: UserPreference = {
  streamingProviders: [],
  country: DEFAULT_COUNTRY,
  language: 'en',
  favouriteGenres: [],
  maxContentRating: DEFAULT_CONTENT_RATING,
  onboardingCompleted: false,
}

/** The profile on the server is the source of truth for preferences; the app's own vocabulary is derived from it. */
export function preferencesFromProfile(user: UserDetails): UserPreference {
  const streamingProviders = [...new Set((user.services ?? []).map((service) => providerForSlug(service)?.id).filter((id): id is StreamingProviderId => Boolean(id)))]
  const favouriteGenres = Object.entries(user.genrePrefs ?? {})
    .filter(([genre, weight]) => weight > 0 && genre in GENRE_MAP)
    .map(([genre]) => genre as MovieGenre)
  const allowed = new Set(user.ratingsAllowed ?? [])
  const ceiling = CONTENT_RATINGS.filter((rating) => allowed.has(rating.id)).reduce((max, rating) => Math.max(max, rating.rank), -1)
  const maxContentRating = CONTENT_RATINGS.find((rating) => rating.rank === ceiling)?.id ?? DEFAULT_CONTENT_RATING
  // Someone who just signed up may have picked a country the profile does not carry yet.
  const country = user.country?.toUpperCase() || readPendingSignup(user.email)?.country || DEFAULT_COUNTRY

  return { streamingProviders, country, language: 'en', favouriteGenres, maxContentRating, onboardingCompleted: user.fullyOnboarded === true }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  // Re-derive when the saved profile changes (sign-in, onboarding saved), not on every unrelated profile update.
  const profileKey = user
    ? JSON.stringify([user.userId, user.country, user.services, user.ratingsAllowed, user.genrePrefs, user.fullyOnboarded])
    : null
  const [store, setStore] = useState(() => ({ key: profileKey, prefs: user ? preferencesFromProfile(user) : DEFAULT_PREFERENCES }))

  let preferences = store.prefs
  if (store.key !== profileKey) {
    preferences = user ? preferencesFromProfile(user) : DEFAULT_PREFERENCES
    setStore({ key: profileKey, prefs: preferences })
  }

  const setPreferences = useCallback((updater: (current: UserPreference) => UserPreference) => setStore((current) => ({ ...current, prefs: updater(current.prefs) })), [])

  const setStreamingProviders = useCallback((ids: StreamingProviderId[]) => setPreferences((current) => ({ ...current, streamingProviders: ids })), [setPreferences])
  const toggleStreamingProvider = useCallback(
    (id: StreamingProviderId) =>
      setPreferences((current) => ({
        ...current,
        streamingProviders: current.streamingProviders.includes(id)
          ? current.streamingProviders.filter((existing) => existing !== id)
          : [...current.streamingProviders, id],
      })),
    [setPreferences],
  )
  const setCountry = useCallback((code: CountryCode) => setPreferences((current) => ({ ...current, country: code })), [setPreferences])
  const setFavouriteGenres = useCallback((genres: MovieGenre[]) => setPreferences((current) => ({ ...current, favouriteGenres: genres })), [setPreferences])
  const toggleFavouriteGenre = useCallback(
    (genre: MovieGenre) =>
      setPreferences((current) => ({
        ...current,
        favouriteGenres: current.favouriteGenres.includes(genre)
          ? current.favouriteGenres.filter((existing) => existing !== genre)
          : [...current.favouriteGenres, genre],
      })),
    [setPreferences],
  )
  const setMaxContentRating = useCallback((rating: ContentRating) => setPreferences((current) => ({ ...current, maxContentRating: rating })), [setPreferences])
  const completeOnboarding = useCallback(() => setPreferences((current) => ({ ...current, onboardingCompleted: true })), [setPreferences])

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      ready: Boolean(user),
      setStreamingProviders,
      toggleStreamingProvider,
      setCountry,
      setFavouriteGenres,
      toggleFavouriteGenre,
      setMaxContentRating,
      completeOnboarding,
    }),
    [preferences, user, setStreamingProviders, toggleStreamingProvider, setCountry, setFavouriteGenres, toggleFavouriteGenre, setMaxContentRating, completeOnboarding],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext)
  if (!context) throw new Error('usePreferences must be used within <PreferencesProvider>')
  return context
}

'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { ContentRating, CountryCode, MovieGenre, StreamingProviderId, UserPreference } from '@/lib/types'
import { DEFAULT_PREFERENCES, type LibraryService } from '@/lib/services/libraryService'
import { useAuth } from '@/lib/store/auth-context'

export interface PreferencesContextValue {
  preferences: UserPreference
  /** False until the signed-in user's preferences have been loaded. */
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

export function PreferencesProvider({ service, children }: { service: LibraryService; children: ReactNode }) {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreference>(DEFAULT_PREFERENCES)
  const [ready, setReady] = useState(false)
  const loadedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!user) {
      loadedFor.current = null
      setPreferences(DEFAULT_PREFERENCES)
      setReady(false)
      return
    }
    let cancelled = false
    setReady(false)
    service.loadPreferences(user.userId, user.country, user.services).then((loaded) => {
      if (cancelled) return
      loadedFor.current = user.userId
      setPreferences(loaded)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [user, service])

  const update = useCallback(
    (updater: (current: UserPreference) => UserPreference) => {
      setPreferences((current) => {
        const next = updater(current)
        if (loadedFor.current) void service.savePreferences(loadedFor.current, next)
        return next
      })
    },
    [service],
  )

  const setStreamingProviders = useCallback(
    (ids: StreamingProviderId[]) => update((current) => ({ ...current, streamingProviders: ids })),
    [update],
  )
  const toggleStreamingProvider = useCallback(
    (id: StreamingProviderId) =>
      update((current) => ({
        ...current,
        streamingProviders: current.streamingProviders.includes(id)
          ? current.streamingProviders.filter((existing) => existing !== id)
          : [...current.streamingProviders, id],
      })),
    [update],
  )
  const setCountry = useCallback((code: CountryCode) => update((current) => ({ ...current, country: code })), [update])
  const setFavouriteGenres = useCallback((genres: MovieGenre[]) => update((current) => ({ ...current, favouriteGenres: genres })), [update])
  const toggleFavouriteGenre = useCallback(
    (genre: MovieGenre) =>
      update((current) => ({
        ...current,
        favouriteGenres: current.favouriteGenres.includes(genre)
          ? current.favouriteGenres.filter((existing) => existing !== genre)
          : [...current.favouriteGenres, genre],
      })),
    [update],
  )
  const setMaxContentRating = useCallback((rating: ContentRating) => update((current) => ({ ...current, maxContentRating: rating })), [update])
  const completeOnboarding = useCallback(() => update((current) => ({ ...current, onboardingCompleted: true })), [update])

  const value = useMemo<PreferencesContextValue>(
    () => ({ preferences, ready, setStreamingProviders, toggleStreamingProvider, setCountry, setFavouriteGenres, toggleFavouriteGenre, setMaxContentRating, completeOnboarding }),
    [preferences, ready, setStreamingProviders, toggleStreamingProvider, setCountry, setFavouriteGenres, toggleFavouriteGenre, setMaxContentRating, completeOnboarding],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext)
  if (!context) throw new Error('usePreferences must be used within <PreferencesProvider>')
  return context
}

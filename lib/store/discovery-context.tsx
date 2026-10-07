'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { DiscoveryFilters, RecommendationRequest, RecommendationResponse, UserMoodId } from '@/lib/types'
import { recommendationService } from '@/lib/services/recommendationService'
import { delay } from '@/lib/storage'
import { useLibrary } from '@/lib/store/library-context'
import { usePreferences } from '@/lib/store/preferences-context'

export type DiscoveryStatus = 'idle' | 'loading' | 'success' | 'error'

export const EMPTY_FILTERS: DiscoveryFilters = {}

/** Minimum time the loading experience stays on screen so the staged messages can play. */
const MIN_LOADING_MS = 3400

export interface DiscoveryContextValue {
  prompt: string
  moods: UserMoodId[]
  filters: DiscoveryFilters
  status: DiscoveryStatus
  response: RecommendationResponse | null
  /** Id of the history entry created for the current response. */
  historyId: string | null
  error: string | null
  activeFilterCount: number
  setPrompt: (prompt: string) => void
  toggleMood: (mood: UserMoodId) => void
  setMoods: (moods: UserMoodId[]) => void
  setFilters: (filters: DiscoveryFilters) => void
  resetFilters: () => void
  findMovies: () => Promise<void>
  /** Prefill from a history entry and immediately run it. */
  rerun: (prompt: string, moods: UserMoodId[]) => Promise<void>
  reset: () => void
}

const DiscoveryContext = createContext<DiscoveryContextValue | null>(null)

export function countActiveFilters(filters: DiscoveryFilters): number {
  let count = 0
  if (filters.maxRuntime) count += 1
  if (filters.mediaType && filters.mediaType !== 'all') count += 1
  if (filters.genres && filters.genres.length > 0) count += 1
  if (filters.releaseYearMin) count += 1
  if (filters.minRating) count += 1
  if (filters.providers && filters.providers.length > 0) count += 1
  if (filters.language && filters.language !== 'any') count += 1
  return count
}

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const { preferences } = usePreferences()
  const library = useLibrary()
  const [prompt, setPrompt] = useState('')
  const [moods, setMoods] = useState<UserMoodId[]>([])
  const [filters, setFilters] = useState<DiscoveryFilters>(EMPTY_FILTERS)
  const [status, setStatus] = useState<DiscoveryStatus>('idle')
  const [response, setResponse] = useState<RecommendationResponse | null>(null)
  const [historyId, setHistoryId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const requestSeq = useRef(0)

  const toggleMood = useCallback((mood: UserMoodId) => {
    setMoods((current) => (current.includes(mood) ? current.filter((m) => m !== mood) : [...current, mood]))
  }, [])

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), [])

  const run = useCallback(
    async (nextPrompt: string, nextMoods: UserMoodId[]) => {
      const seq = ++requestSeq.current
      setStatus('loading')
      setError(null)

      const request: RecommendationRequest = {
        prompt: nextPrompt,
        moods: nextMoods,
        streamingProviders: preferences.streamingProviders,
        country: preferences.country,
        favouriteGenres: preferences.favouriteGenres,
        maxContentRating: preferences.maxContentRating,
        filters: countActiveFilters(filters) > 0 ? filters : undefined,
      }
      const context = {
        likedMovieIds: library.likedIds,
        excludeMovieIds: Object.values(library.feedback)
          .filter((f) => f.liked === false || f.watched)
          .map((f) => f.movieId),
      }

      try {
        const [result] = await Promise.all([recommendationService.getRecommendations(request, context), delay(MIN_LOADING_MS)])
        if (seq !== requestSeq.current) return
        setResponse(result)
        setStatus('success')
        const entryId = `hist_${result.id}`
        setHistoryId(entryId)
        library.addHistoryEntry({
          id: entryId,
          createdAt: result.createdAt,
          prompt: nextPrompt,
          moods: nextMoods,
          interpretation: result.interpretation,
          recommendedMovieIds: result.recommendations.slice(0, 6).map((rec) => rec.movie.id),
        })
      } catch (err) {
        if (seq !== requestSeq.current) return
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
    },
    [filters, library, preferences.country, preferences.streamingProviders, preferences.favouriteGenres, preferences.maxContentRating],
  )

  const findMovies = useCallback(() => run(prompt, moods), [run, prompt, moods])

  const rerun = useCallback(
    async (nextPrompt: string, nextMoods: UserMoodId[]) => {
      setPrompt(nextPrompt)
      setMoods(nextMoods)
      await run(nextPrompt, nextMoods)
    },
    [run],
  )

  const reset = useCallback(() => {
    requestSeq.current += 1
    setStatus('idle')
    setResponse(null)
    setHistoryId(null)
    setError(null)
  }, [])

  const value = useMemo<DiscoveryContextValue>(
    () => ({
      prompt,
      moods,
      filters,
      status,
      response,
      historyId,
      error,
      activeFilterCount: countActiveFilters(filters),
      setPrompt,
      toggleMood,
      setMoods,
      setFilters,
      resetFilters,
      findMovies,
      rerun,
      reset,
    }),
    [prompt, moods, filters, status, response, historyId, error, toggleMood, resetFilters, findMovies, rerun, reset],
  )

  return <DiscoveryContext.Provider value={value}>{children}</DiscoveryContext.Provider>
}

export function useDiscovery(): DiscoveryContextValue {
  const context = useContext(DiscoveryContext)
  if (!context) throw new Error('useDiscovery must be used within <DiscoveryProvider>')
  return context
}

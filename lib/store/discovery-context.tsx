'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { DiscoveryFilters, HistoryEntry, MoodObjective, RecommendationRequest, RecommendationResponse, UserMoodId } from '@/lib/types'
import { buildRecommendBody } from '@/lib/api/adapters'
import { RecommendationError, requestRecommendations, type RecommendationErrorKind } from '@/lib/api/recommendations'
import { useLibrary } from '@/lib/store/library-context'
import { useAuth } from '@/lib/store/auth-context'
import { useBilling } from '@/lib/store/billing-context'
import { usePreferences } from '@/lib/store/preferences-context'

export type DiscoveryStatus = 'idle' | 'loading' | 'success' | 'error'

export const EMPTY_FILTERS: DiscoveryFilters = {}

export interface DiscoveryContextValue {
  prompt: string
  moods: UserMoodId[]
  /** Match the mood the user is in, or lift it. */
  objective: MoodObjective
  filters: DiscoveryFilters
  status: DiscoveryStatus
  response: RecommendationResponse | null
  /** Id of the history entry created for the current response (the backend request id). */
  historyId: string | null
  error: string | null
  errorKind: RecommendationErrorKind | null
  activeFilterCount: number
  setPrompt: (prompt: string) => void
  toggleMood: (mood: UserMoodId) => void
  setMoods: (moods: UserMoodId[]) => void
  setObjective: (objective: MoodObjective) => void
  setFilters: (filters: DiscoveryFilters) => void
  resetFilters: () => void
  findMovies: () => Promise<void>
  /** Prefill from a history entry and immediately run it. */
  rerun: (prompt: string, moods: UserMoodId[], objective?: MoodObjective) => Promise<void>
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
  const { user } = useAuth()
  const { recordUsage } = useBilling()
  const library = useLibrary()
  const [prompt, setPrompt] = useState('')
  const [moods, setMoods] = useState<UserMoodId[]>([])
  const [objective, setObjective] = useState<MoodObjective>('keep')
  const [filters, setFilters] = useState<DiscoveryFilters>(EMPTY_FILTERS)
  const [status, setStatus] = useState<DiscoveryStatus>('idle')
  const [response, setResponse] = useState<RecommendationResponse | null>(null)
  const [historyId, setHistoryId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorKind, setErrorKind] = useState<RecommendationErrorKind | null>(null)
  const requestSeq = useRef(0)
  const { addHistoryEntry } = library

  const toggleMood = useCallback((mood: UserMoodId) => {
    setMoods((current) => (current.includes(mood) ? current.filter((m) => m !== mood) : [...current, mood]))
  }, [])

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), [])

  const run = useCallback(
    async (nextPrompt: string, nextMoods: UserMoodId[], nextObjective: MoodObjective) => {
      const seq = ++requestSeq.current
      setStatus('loading')
      setError(null)
      setErrorKind(null)

      const request: RecommendationRequest = {
        prompt: nextPrompt,
        moods: nextMoods,
        objective: nextObjective,
        filters: countActiveFilters(filters) > 0 ? filters : undefined,
      }

      try {
        // Country, services, ratings and taste come from the saved profile on the server.
        const result = await requestRecommendations(request, preferences.streamingProviders)
        if (seq !== requestSeq.current) return
        setResponse(result)
        setStatus('success')
        setHistoryId(result.id)
        const entry: HistoryEntry = {
          id: result.id,
          createdAt: result.createdAt,
          prompt: buildRecommendBody(request).text,
          moods: nextMoods,
          interpretation: result.interpretation,
          recommendedMovieIds: result.recommendations.map((rec) => rec.movie.id),
        }
        addHistoryEntry(entry, result.recommendations.map((rec) => rec.movie))
        if (result.usage) recordUsage(result.usage)
      } catch (err) {
        if (seq !== requestSeq.current) return
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
        setErrorKind(err instanceof RecommendationError ? err.kind : 'generic')
        // A 429 says exactly where the person stands; show it rather than a stale count.
        if (err instanceof RecommendationError && err.rateLimit) {
          recordUsage({ plan: err.rateLimit.plan, used: err.rateLimit.used, limit: err.rateLimit.limit, remaining: 0, resetsAt: err.rateLimit.resetsAt })
        }
      }
    },
    [filters, preferences.streamingProviders, addHistoryEntry, recordUsage],
  )

  const findMovies = useCallback(() => run(prompt, moods, objective), [run, prompt, moods, objective])

  const rerun = useCallback(
    async (nextPrompt: string, nextMoods: UserMoodId[], nextObjective: MoodObjective = objective) => {
      setPrompt(nextPrompt)
      setMoods(nextMoods)
      setObjective(nextObjective)
      await run(nextPrompt, nextMoods, nextObjective)
    },
    [run, objective],
  )

  const reset = useCallback(() => {
    requestSeq.current += 1
    setStatus('idle')
    setResponse(null)
    setHistoryId(null)
    setError(null)
    setErrorKind(null)
  }, [])

  // Nothing from one person's session should be on screen for the next.
  const userId = user?.userId ?? null
  useEffect(() => {
    reset()
    setPrompt('')
    setMoods([])
    setFilters(EMPTY_FILTERS)
  }, [userId, reset])

  const value = useMemo<DiscoveryContextValue>(
    () => ({
      prompt,
      moods,
      objective,
      filters,
      status,
      response,
      historyId,
      error,
      errorKind,
      activeFilterCount: countActiveFilters(filters),
      setPrompt,
      toggleMood,
      setMoods,
      setObjective,
      setFilters,
      resetFilters,
      findMovies,
      rerun,
      reset,
    }),
    [prompt, moods, objective, filters, status, response, historyId, error, errorKind, toggleMood, resetFilters, findMovies, rerun, reset],
  )

  return <DiscoveryContext.Provider value={value}>{children}</DiscoveryContext.Provider>
}

export function useDiscovery(): DiscoveryContextValue {
  const context = useContext(DiscoveryContext)
  if (!context) throw new Error('useDiscovery must be used within <DiscoveryProvider>')
  return context
}

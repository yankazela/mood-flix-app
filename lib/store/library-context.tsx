'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { FeedbackRating, HistoryEntry, MovieFeedback } from '@/lib/types'
import { EMPTY_LIBRARY, type LibraryService, type LibraryState } from '@/lib/services/libraryService'
import { useAuth } from '@/lib/store/auth-context'

export interface LibraryContextValue extends LibraryState {
  ready: boolean
  getFeedback: (movieId: string) => MovieFeedback | undefined
  toggleSaved: (movieId: string) => void
  /** Pass `true` to like, `false` to dislike. Calling with the current value clears it. */
  setLiked: (movieId: string, liked: boolean) => void
  toggleWatched: (movieId: string) => void
  rateMovie: (movieId: string, rating: FeedbackRating, recommendationId?: string) => void
  addHistoryEntry: (entry: HistoryEntry) => void
  recordSelection: (historyId: string, movieId: string) => void
  recordHistoryFeedback: (historyId: string, rating: FeedbackRating) => void
  savedIds: string[]
  likedIds: string[]
  watchedIds: string[]
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

function sortByUpdated(entries: MovieFeedback[]): MovieFeedback[] {
  return [...entries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function LibraryProvider({ service, children }: { service: LibraryService; children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<LibraryState>(EMPTY_LIBRARY)
  const [ready, setReady] = useState(false)
  const loadedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!user) {
      loadedFor.current = null
      setState(EMPTY_LIBRARY)
      setReady(false)
      return
    }
    let cancelled = false
    setReady(false)
    service.loadLibrary(user.userId).then((loaded) => {
      if (cancelled) return
      loadedFor.current = user.userId
      setState(loaded)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [user, service])

  const update = useCallback(
    (updater: (current: LibraryState) => LibraryState) => {
      setState((current) => {
        const next = updater(current)
        if (loadedFor.current) void service.saveLibrary(loadedFor.current, next)
        return next
      })
    },
    [service],
  )

  const patchFeedback = useCallback(
    (movieId: string, patch: (current: MovieFeedback) => Partial<MovieFeedback>) =>
      update((current) => {
        const existing: MovieFeedback = current.feedback[movieId] ?? {
          movieId,
          watched: false,
          saved: false,
          updatedAt: new Date().toISOString(),
        }
        const next: MovieFeedback = { ...existing, ...patch(existing), updatedAt: new Date().toISOString() }
        return { ...current, feedback: { ...current.feedback, [movieId]: next } }
      }),
    [update],
  )

  const getFeedback = useCallback((movieId: string) => state.feedback[movieId], [state.feedback])
  const toggleSaved = useCallback((movieId: string) => patchFeedback(movieId, (f) => ({ saved: !f.saved })), [patchFeedback])
  const setLiked = useCallback(
    (movieId: string, liked: boolean) => patchFeedback(movieId, (f) => ({ liked: f.liked === liked ? undefined : liked })),
    [patchFeedback],
  )
  const toggleWatched = useCallback((movieId: string) => patchFeedback(movieId, (f) => ({ watched: !f.watched })), [patchFeedback])
  const rateMovie = useCallback(
    (movieId: string, rating: FeedbackRating, recommendationId?: string) =>
      patchFeedback(movieId, () => ({
        rating,
        recommendationId,
        liked: rating === 'perfect' || rating === 'good' ? true : rating === 'not-for-me' ? false : undefined,
      })),
    [patchFeedback],
  )

  const addHistoryEntry = useCallback(
    (entry: HistoryEntry) => update((current) => ({ ...current, history: [entry, ...current.history].slice(0, 50) })),
    [update],
  )
  const recordSelection = useCallback(
    (historyId: string, movieId: string) =>
      update((current) => ({
        ...current,
        history: current.history.map((entry) => (entry.id === historyId ? { ...entry, selectedMovieId: movieId } : entry)),
      })),
    [update],
  )
  const recordHistoryFeedback = useCallback(
    (historyId: string, rating: FeedbackRating) =>
      update((current) => ({
        ...current,
        history: current.history.map((entry) => (entry.id === historyId ? { ...entry, feedback: rating } : entry)),
      })),
    [update],
  )

  const entries = useMemo(() => sortByUpdated(Object.values(state.feedback)), [state.feedback])
  const savedIds = useMemo(() => entries.filter((f) => f.saved).map((f) => f.movieId), [entries])
  const likedIds = useMemo(() => entries.filter((f) => f.liked === true).map((f) => f.movieId), [entries])
  const watchedIds = useMemo(() => entries.filter((f) => f.watched).map((f) => f.movieId), [entries])

  const value = useMemo<LibraryContextValue>(
    () => ({
      ...state,
      ready,
      getFeedback,
      toggleSaved,
      setLiked,
      toggleWatched,
      rateMovie,
      addHistoryEntry,
      recordSelection,
      recordHistoryFeedback,
      savedIds,
      likedIds,
      watchedIds,
    }),
    [state, ready, getFeedback, toggleSaved, setLiked, toggleWatched, rateMovie, addHistoryEntry, recordSelection, recordHistoryFeedback, savedIds, likedIds, watchedIds],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext)
  if (!context) throw new Error('useLibrary must be used within <LibraryProvider>')
  return context
}

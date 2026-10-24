'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { FeedbackRating, HistoryEntry, Movie, MovieFeedback } from '@/lib/types'
import type { ApiLibraryPatch } from '@/lib/api/types'
import type { UserDetails } from '@/app/(auth)/signup/store/state'
import { toMovie } from '@/lib/api/adapters'
import { fetchMovies } from '@/lib/api/movies'
import { fetchHistory, recordOutcome } from '@/lib/api/recommendations'
import { fetchProfile, patchLibrary } from '@/lib/api/user'
import { useAuth } from '@/lib/store/auth-context'

type Vote = 'up' | 'down'

/** What the server holds about a user's relationship with titles, plus the titles themselves for display. */
interface LibraryState {
  /** Newest first. */
  savedIds: string[]
  watchedIds: string[]
  votes: Record<string, Vote>
  ratings: Record<string, FeedbackRating>
  history: HistoryEntry[]
  movies: Record<string, Movie>
}

const EMPTY_STATE: LibraryState = { savedIds: [], watchedIds: [], votes: {}, ratings: {}, history: [], movies: {} }

const MAX_HISTORY = 50

export interface LibraryContextValue {
  /** False until the signed-in user's library has been loaded. */
  ready: boolean
  loadError: string | null
  /** Set when a change could not be saved; the library has been reloaded from the server. */
  syncError: string | null
  clearSyncError: () => void
  history: HistoryEntry[]
  feedback: Record<string, MovieFeedback>
  getFeedback: (movieId: string) => MovieFeedback | undefined
  /** A title the library has seen: saved, rated, in the history or just acted on. */
  getMovie: (movieId: string) => Movie | undefined
  toggleSaved: (movie: Movie) => void
  /** Pass `true` to like, `false` to dislike. Calling with the current value clears it. `requestId` links the vote to a recommendation. */
  setLiked: (movie: Movie, liked: boolean, requestId?: string) => void
  toggleWatched: (movie: Movie) => void
  /** Marks a title watched without toggling it back off. */
  markWatched: (movie: Movie) => void
  rateMovie: (movie: Movie, rating: FeedbackRating) => void
  /** Adds the request that was just made, whose results the server has already saved. */
  addHistoryEntry: (entry: HistoryEntry, movies: Movie[]) => void
  recordSelection: (historyId: string, movie: Movie) => void
  recordHistoryFeedback: (historyId: string, rating: FeedbackRating) => void
  savedIds: string[]
  likedIds: string[]
  watchedIds: string[]
  savedMovies: Movie[]
  likedMovies: Movie[]
  watchedMovies: Movie[]
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

function voteMap(votes: UserDetails['votes'] | undefined): Record<string, Vote> {
  return Object.fromEntries(Object.entries(votes ?? {}).map(([itemId, entry]) => [itemId, entry.vote]))
}

function rememberMovie(movies: Record<string, Movie>, movie: Movie): Record<string, Movie> {
  return movies[movie.id] === movie ? movies : { ...movies, [movie.id]: movie }
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Something went wrong while saving. Please try again.'
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.userId ?? null
  const [state, setState] = useState<LibraryState>(EMPTY_STATE)
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  // Mutations read the latest state synchronously, so two quick taps never build on a stale copy.
  const stateRef = useRef(state)
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const activeUser = useRef<string | null>(null)

  const commit = useCallback((next: LibraryState) => {
    stateRef.current = next
    setState(next)
  }, [])

  const load = useCallback(async (): Promise<LibraryState> => {
    const profile = await fetchProfile()
    const savedMovies = (profile.savedMovies ?? []).map(toMovie)
    const known = new Map(savedMovies.map((movie) => [movie.id, movie]))
    const votes = voteMap(profile.votes)
    const savedIds = profile.myMovies ?? savedMovies.map((movie) => movie.id)
    const watchedIds = profile.watched ?? []
    const likedIds = Object.entries(votes).filter(([, vote]) => vote === 'up').map(([id]) => id)
    const missing = [...new Set([...watchedIds, ...likedIds])].filter((id) => !known.has(id))

    // Titles and history are nice to have; a failure in either should not hide the rest of the library.
    const [extra, past] = await Promise.all([
      fetchMovies(missing).catch(() => [] as Movie[]),
      fetchHistory(MAX_HISTORY).catch(() => ({ entries: [] as HistoryEntry[], movies: [] as Movie[] })),
    ])
    const movies: Record<string, Movie> = {}
    for (const movie of [...extra, ...past.movies, ...savedMovies]) movies[movie.id] = movie

    return { savedIds, watchedIds, votes, ratings: profile.ratings ?? {}, history: past.entries, movies }
  }, [])

  useEffect(() => {
    activeUser.current = userId
    queue.current = Promise.resolve()
    if (!userId) {
      commit(EMPTY_STATE)
      setReady(false)
      setLoadError(null)
      setSyncError(null)
      return
    }
    let cancelled = false
    setReady(false)
    setLoadError(null)
    load()
      .then((loaded) => {
        if (!cancelled) commit(loaded)
      })
      .catch((error) => {
        if (!cancelled) setLoadError(errorMessage(error))
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [userId, load, commit])

  /** Runs saves one after another, so the server sees changes in the order they were made. */
  const enqueue = useCallback(
    (task: () => Promise<unknown>, options: { silent?: boolean } = {}) => {
      const owner = activeUser.current
      queue.current = queue.current.then(task).catch(async (error) => {
        if (activeUser.current !== owner) return
        if (options.silent) {
          console.warn('[library] Could not save:', error)
          return
        }
        setSyncError(errorMessage(error))
        // Put the screen back in line with what the server really has.
        try {
          const fresh = await load()
          if (activeUser.current === owner) commit({ ...fresh, history: stateRef.current.history })
        } catch {
          // Offline: keep the optimistic state; the next load reconciles it.
        }
      })
    },
    [load, commit],
  )

  const save = useCallback((patch: ApiLibraryPatch) => enqueue(() => patchLibrary(patch)), [enqueue])

  const toggleSaved = useCallback(
    (movie: Movie) => {
      const current = stateRef.current
      const savedIds = current.savedIds.includes(movie.id) ? current.savedIds.filter((id) => id !== movie.id) : [movie.id, ...current.savedIds]
      commit({ ...current, savedIds, movies: rememberMovie(current.movies, movie) })
      save({ myMovies: savedIds })
    },
    [commit, save],
  )

  const setVote = useCallback(
    (current: LibraryState, movie: Movie, vote: Vote | null, requestId?: string): { state: LibraryState; patch: ApiLibraryPatch } => {
      const votes = { ...current.votes }
      if (vote === null) delete votes[movie.id]
      else votes[movie.id] = vote
      const patch: ApiLibraryPatch = vote === null ? { removeVotes: [movie.id] } : { votes: { [movie.id]: { vote, requestId } } }
      return { state: { ...current, votes, movies: rememberMovie(current.movies, movie) }, patch }
    },
    [],
  )

  const setLiked = useCallback(
    (movie: Movie, liked: boolean, requestId?: string) => {
      const desired: Vote = liked ? 'up' : 'down'
      const { state: next, patch } = setVote(stateRef.current, movie, stateRef.current.votes[movie.id] === desired ? null : desired, requestId)
      commit(next)
      save(patch)
    },
    [commit, save, setVote],
  )

  const writeWatched = useCallback(
    (movie: Movie, watched: boolean) => {
      const current = stateRef.current
      if (current.watchedIds.includes(movie.id) === watched) return
      const watchedIds = watched ? [movie.id, ...current.watchedIds] : current.watchedIds.filter((id) => id !== movie.id)
      commit({ ...current, watchedIds, movies: rememberMovie(current.movies, movie) })
      save({ watched: watchedIds })
    },
    [commit, save],
  )

  const toggleWatched = useCallback((movie: Movie) => writeWatched(movie, !stateRef.current.watchedIds.includes(movie.id)), [writeWatched])
  const markWatched = useCallback((movie: Movie) => writeWatched(movie, true), [writeWatched])

  const rateMovie = useCallback(
    (movie: Movie, rating: FeedbackRating) => {
      // A good rating counts as a thumbs-up and "not for me" as a thumbs-down; "okay" is no signal.
      const vote: Vote | null = rating === 'perfect' || rating === 'good' ? 'up' : rating === 'not-for-me' ? 'down' : null
      const current = stateRef.current
      const hadVote = current.votes[movie.id] !== undefined
      const { state: voted, patch } = setVote(current, movie, vote)
      commit({ ...voted, ratings: { ...voted.ratings, [movie.id]: rating } })
      const ratings = { [movie.id]: rating }
      if (vote === null && !hadVote) save({ ratings })
      else save({ ratings, ...patch })
    },
    [commit, save, setVote],
  )

  const addHistoryEntry = useCallback(
    (entry: HistoryEntry, movies: Movie[]) => {
      const current = stateRef.current
      const known = { ...current.movies }
      for (const movie of movies) known[movie.id] = movie
      commit({ ...current, movies: known, history: [entry, ...current.history.filter((existing) => existing.id !== entry.id)].slice(0, MAX_HISTORY) })
    },
    [commit],
  )

  const patchEntry = useCallback(
    (historyId: string, change: Partial<HistoryEntry>) => {
      const current = stateRef.current
      commit({ ...current, history: current.history.map((entry) => (entry.id === historyId ? { ...entry, ...change } : entry)) })
    },
    [commit],
  )

  const recordSelection = useCallback(
    (historyId: string, movie: Movie) => {
      patchEntry(historyId, { selectedMovieId: movie.id })
      enqueue(() => recordOutcome(historyId, { selectedItemId: movie.id }), { silent: true })
    },
    [patchEntry, enqueue],
  )

  const recordHistoryFeedback = useCallback(
    (historyId: string, rating: FeedbackRating) => {
      patchEntry(historyId, { feedback: rating })
      enqueue(() => recordOutcome(historyId, { feedback: rating }), { silent: true })
    },
    [patchEntry, enqueue],
  )

  const feedback = useMemo(() => {
    const ids = new Set([...state.savedIds, ...state.watchedIds, ...Object.keys(state.votes), ...Object.keys(state.ratings)])
    const entries: Record<string, MovieFeedback> = {}
    for (const movieId of ids) {
      const vote = state.votes[movieId]
      entries[movieId] = {
        movieId,
        saved: state.savedIds.includes(movieId),
        watched: state.watchedIds.includes(movieId),
        liked: vote === 'up' ? true : vote === 'down' ? false : undefined,
        rating: state.ratings[movieId],
      }
    }
    return entries
  }, [state.savedIds, state.watchedIds, state.votes, state.ratings])

  const getFeedback = useCallback((movieId: string) => feedback[movieId], [feedback])
  const getMovie = useCallback((movieId: string) => state.movies[movieId], [state.movies])
  const clearSyncError = useCallback(() => setSyncError(null), [])

  const likedIds = useMemo(() => Object.entries(state.votes).filter(([, vote]) => vote === 'up').map(([id]) => id), [state.votes])
  const lookup = useCallback((ids: string[]) => ids.map((id) => state.movies[id]).filter((movie): movie is Movie => Boolean(movie)), [state.movies])
  const savedMovies = useMemo(() => lookup(state.savedIds), [lookup, state.savedIds])
  const likedMovies = useMemo(() => lookup(likedIds), [lookup, likedIds])
  const watchedMovies = useMemo(() => lookup(state.watchedIds), [lookup, state.watchedIds])

  const value = useMemo<LibraryContextValue>(
    () => ({
      ready,
      loadError,
      syncError,
      clearSyncError,
      history: state.history,
      feedback,
      getFeedback,
      getMovie,
      toggleSaved,
      setLiked,
      toggleWatched,
      markWatched,
      rateMovie,
      addHistoryEntry,
      recordSelection,
      recordHistoryFeedback,
      savedIds: state.savedIds,
      likedIds,
      watchedIds: state.watchedIds,
      savedMovies,
      likedMovies,
      watchedMovies,
    }),
    [
      ready,
      loadError,
      syncError,
      clearSyncError,
      state.history,
      state.savedIds,
      state.watchedIds,
      feedback,
      getFeedback,
      getMovie,
      toggleSaved,
      setLiked,
      toggleWatched,
      markWatched,
      rateMovie,
      addHistoryEntry,
      recordSelection,
      recordHistoryFeedback,
      likedIds,
      savedMovies,
      likedMovies,
      watchedMovies,
    ],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext)
  if (!context) throw new Error('useLibrary must be used within <LibraryProvider>')
  return context
}

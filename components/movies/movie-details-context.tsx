'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Movie, Recommendation } from '@/lib/types'
import { MovieDetailsModal } from '@/components/movies/movie-details-modal'

export interface DetailsTarget {
  movie: Movie
  recommendation?: Recommendation
}

interface MovieDetailsContextValue {
  target: DetailsTarget | null
  open: (movie: Movie, recommendation?: Recommendation) => void
  close: () => void
}

const MovieDetailsContext = createContext<MovieDetailsContextValue | null>(null)

export function MovieDetailsProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<DetailsTarget | null>(null)
  const open = useCallback((movie: Movie, recommendation?: Recommendation) => setTarget({ movie, recommendation }), [])
  const close = useCallback(() => setTarget(null), [])
  const value = useMemo(() => ({ target, open, close }), [target, open, close])
  return (
    <MovieDetailsContext.Provider value={value}>
      {children}
      <MovieDetailsModal target={target} onClose={close} />
    </MovieDetailsContext.Provider>
  )
}

export function useMovieDetails(): MovieDetailsContextValue {
  const context = useContext(MovieDetailsContext)
  if (!context) throw new Error('useMovieDetails must be used within <MovieDetailsProvider>')
  return context
}

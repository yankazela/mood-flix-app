'use client'

import { useEffect } from 'react'
import { useScrollLock } from '@/lib/hooks/use-scroll-lock'
import { MovieDetails } from '@/components/movies/movie-details'
import type { DetailsTarget } from '@/components/movies/movie-details-context'

interface MovieDetailsModalProps {
  target: DetailsTarget | null
  onClose: () => void
}

export function MovieDetailsModal({ target, onClose }: MovieDetailsModalProps) {
  useScrollLock(Boolean(target))

  useEffect(() => {
    if (!target) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [target, onClose])

  if (!target) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${target.movie.title} details`}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/80 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-h-[94dvh] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface shadow-2xl ring-1 ring-white/10 animate-fade-up sm:rounded-[28px] [scrollbar-width:thin]"
        onClick={(event) => event.stopPropagation()}
      >
        <MovieDetails movie={target.movie} recommendation={target.recommendation} variant="modal" onClose={onClose} />
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { Movie } from '@/lib/types'
import { movieService } from '@/lib/services/movieService'
import { formatGenres, formatRuntime } from '@/lib/format'
import { useScrollLock } from '@/lib/hooks/use-scroll-lock'
import { useMovieDetails } from '@/components/movies/movie-details-context'
import { PosterImage } from '@/components/movies/poster-image'
import { RatingBadge } from '@/components/movies/rating-badge'

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Movie[]>([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { open: openDetails } = useMovieDetails()
  useScrollLock(open)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      return
    }
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    if (!query.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    const timer = setTimeout(async () => {
      const found = await movieService.searchMovies(query)
      if (cancelled) return
      setResults(found)
      setSearching(false)
    }, 160)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[85] flex items-start justify-center bg-ink/80 p-3 pt-[8vh] backdrop-blur-sm animate-fade-in sm:p-6 sm:pt-[12vh]" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Search movies" className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-surface-2 shadow-2xl animate-scale-in" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-white/6 px-4 py-3 sm:px-5">
          <Search className="size-5 shrink-0 text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, director, actor or genre"
            className="h-11 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/30"
            autoComplete="off"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="flex size-9 items-center justify-center rounded-full text-white/50 hover:bg-white/8 hover:text-white">
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 [scrollbar-width:thin]">
          {!query.trim() && <p className="px-4 py-8 text-center text-sm text-white/40">Start typing to search the catalog.</p>}
          {query.trim() && !searching && results.length === 0 && <p className="px-4 py-8 text-center text-sm text-white/40">No matches for “{query}”.</p>}
          {results.map((movie) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => {
                onClose()
                openDetails(movie)
              }}
              className="flex w-full items-center gap-4 rounded-2xl p-2 text-left transition hover:bg-white/6"
            >
              <PosterImage movie={movie} size="w185" className="aspect-[2/3] w-12 shrink-0 rounded-lg" sizes="48px" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{movie.title}</p>
                <p className="truncate text-xs text-white/45">
                  {movie.releaseYear} · {formatRuntime(movie.runtimeMinutes)} · {formatGenres(movie.genres, 2)}
                </p>
              </div>
              <RatingBadge rating={movie.rating} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { Bookmark, BookmarkCheck, Info, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { Movie, Recommendation } from '@/lib/types'
import { formatGenres, formatRuntime } from '@/lib/format'
import { availableProviders } from '@/lib/recommendation/engine'
import { usePreferences } from '@/lib/store/preferences-context'
import { useMovieActions } from '@/lib/hooks/use-movie-actions'
import { useMovieDetails } from '@/components/movies/movie-details-context'
import { PosterImage } from '@/components/movies/poster-image'
import { MatchBadge } from '@/components/movies/match-badge'
import { RatingBadge } from '@/components/movies/rating-badge'
import { StreamingProviderBadge } from '@/components/movies/streaming-provider-badge'
import { cn } from '@/lib/utils'

export type MovieCardSize = 'sm' | 'md' | 'lg'

interface MovieCardProps {
  movie: Movie
  recommendation?: Recommendation
  /** Fixed widths for horizontal rows. Ignored when `fluid`. */
  size?: MovieCardSize
  /** Fill the parent (grid layouts). */
  fluid?: boolean
  /** Top-pick treatment: rank number + stronger match badge. */
  rank?: number
  /** Index used for staggered entrance animation. */
  index?: number
  className?: string
  priority?: boolean
}

const WIDTHS: Record<MovieCardSize, string> = {
  sm: 'w-[136px] sm:w-[150px]',
  md: 'w-[160px] sm:w-[190px] lg:w-[210px]',
  lg: 'w-[200px] sm:w-[240px]',
}

export function MovieCard({ movie, recommendation, size = 'md', fluid = false, rank, index = 0, className, priority }: MovieCardProps) {
  const { preferences } = usePreferences()
  const { open } = useMovieDetails()
  const { saved, liked, disliked, toggleSaved, like, dislike } = useMovieActions(movie)
  const providers = availableProviders(movie, preferences.country, preferences.streamingProviders)
  const provider = providers[0]
  const matchScore = recommendation?.matchScore

  return (
    <article
      className={cn('group relative shrink-0 snap-start animate-fade-up stagger', !fluid && WIDTHS[size], fluid && 'w-full', className)}
      style={{ '--stagger-index': Math.min(index, 12) } as React.CSSProperties}
    >
      <div
        className={cn(
          'relative aspect-[2/3] overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-white/6 transition-all duration-500 ease-out-expo',
          'group-hover:-translate-y-1 group-hover:scale-[1.025] group-hover:ring-white/15 group-hover:poster-shadow group-focus-within:scale-[1.02]',
          rank !== undefined && 'rounded-3xl',
        )}
      >
        <PosterImage
          movie={movie}
          className="absolute inset-0"
          imgClassName="transition-transform duration-700 group-hover:scale-105"
          priority={priority}
          sizes={fluid ? '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw' : '240px'}
        />

        {/* Ambient bottom gradient, always on for legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
        {/* Hover overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100" />

        {/* Open details (full-card hit target) */}
        <button
          type="button"
          onClick={() => open(movie, recommendation)}
          aria-label={`View details for ${movie.title}`}
          className="absolute inset-0 z-10 cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
        />

        {/* Top row: match + rating */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-2.5 sm:p-3">
          {matchScore !== undefined ? <MatchBadge score={matchScore} size={rank !== undefined ? 'md' : 'sm'} /> : <span />}
          <span className="rounded-full bg-black/45 px-2 py-1 backdrop-blur-md">
            <RatingBadge rating={movie.rating} />
          </span>
        </div>

        {rank !== undefined && (
          <span className="pointer-events-none absolute left-3 top-12 z-20 font-display text-6xl italic leading-none text-white/90 text-shadow-strong sm:text-7xl">
            {rank}
          </span>
        )}

        {/* Bottom info */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 sm:p-3.5">
          {provider && (
            <div className="mb-2 flex items-center gap-1.5">
              <StreamingProviderBadge providerId={provider} size="xs" />
              {saved && (
                <span className="flex size-5 items-center justify-center rounded-md bg-brand text-brand-foreground" aria-label="Saved">
                  <BookmarkCheck className="size-3" strokeWidth={2.5} />
                </span>
              )}
            </div>
          )}
          <h3 className={cn('truncate font-semibold leading-tight text-white', rank !== undefined ? 'text-base sm:text-lg' : 'text-sm')}>{movie.title}</h3>
          <p className="mt-1 truncate text-[11px] text-white/55 sm:text-xs">
            {movie.releaseYear} · {formatRuntime(movie.runtimeMinutes)} · {formatGenres(movie.genres, 2)}
          </p>

          {/* Quick actions (hover / focus) */}
          <div className="pointer-events-auto mt-3 hidden translate-y-2 items-center gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 sm:flex">
            <button
              type="button"
              onClick={() => open(movie, recommendation)}
              className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white text-xs font-semibold text-ink transition hover:bg-brand"
            >
              <Info className="size-3.5" /> Details
            </button>
            <QuickAction label={saved ? 'Remove from My Movies' : 'Add to My Movies'} active={saved} onClick={toggleSaved}>
              {saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
            </QuickAction>
            <QuickAction label="Like" active={liked} onClick={like}>
              <ThumbsUp className="size-3.5" />
            </QuickAction>
            <QuickAction label="Dislike" active={disliked} onClick={dislike}>
              <ThumbsDown className="size-3.5" />
            </QuickAction>
          </div>
        </div>
      </div>
    </article>
  )
}

function QuickAction({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={cn(
        'flex size-8 items-center justify-center rounded-lg border border-white/10 bg-black/50 text-white/80 backdrop-blur-md transition hover:bg-white/15 hover:text-white',
        active && 'border-brand bg-brand text-brand-foreground hover:bg-brand hover:text-brand-foreground',
      )}
    >
      {children}
    </button>
  )
}

export function MovieCardSkeleton({ size = 'md', fluid = false, className }: { size?: MovieCardSize; fluid?: boolean; className?: string }) {
  return (
    <div className={cn('shrink-0', !fluid && WIDTHS[size], fluid && 'w-full', className)} aria-hidden>
      <div className="skeleton aspect-[2/3] rounded-2xl" />
    </div>
  )
}

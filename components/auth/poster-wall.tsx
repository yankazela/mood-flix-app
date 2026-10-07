'use client'

import { MOVIES } from '@/lib/data/movies'
import { posterUrl } from '@/lib/tmdb'
import { cn } from '@/lib/utils'

/**
 * Cinematic background: slow-drifting columns of real posters under a heavy
 * dark overlay. Pure CSS animation, no JS on the hot path.
 */
export function PosterWall({ className }: { className?: string }) {
  const posters = MOVIES.map((movie) => ({ id: movie.id, src: posterUrl(movie.posterPath, 'w342')!, title: movie.title }))
  const columns = [0, 1, 2, 3, 4, 5].map((column) => posters.filter((_, index) => index % 6 === column))

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden bg-ink', className)} aria-hidden>
      <div className="absolute inset-[-12%] flex rotate-[-8deg] gap-4 opacity-[0.55] sm:gap-5">
        {columns.map((column, index) => (
          <div key={index} className={cn('flex w-[150px] shrink-0 flex-col gap-4 sm:w-[190px] sm:gap-5', index % 2 === 0 ? 'animate-drift' : 'animate-drift [animation-direction:reverse]')} style={{ animationDuration: `${70 + index * 9}s` }}>
            {[...column, ...column].map((poster, i) => (
              <img key={`${poster.id}-${i}`} src={poster.src} alt="" className="aspect-[2/3] w-full rounded-xl object-cover" loading={i < 4 ? 'eager' : 'lazy'} draggable={false} />
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/80 to-ink" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,11,13,0.1)_0%,rgba(10,11,13,0.85)_70%)]" />
      <div className="absolute left-1/2 top-1/3 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-brand/10 blur-[160px]" />
    </div>
  )
}

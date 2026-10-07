'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { MovieCardSkeleton } from '@/components/movies/movie-card'
import { Skeleton } from '@/components/shared/skeleton'
import { cn } from '@/lib/utils'

const STAGES = ['Understanding your mood...', 'Searching thousands of movies...', 'Finding the perfect matches...']
const STAGE_MS = 1100

export function LoadingRecommendations() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setStage((current) => Math.min(current + 1, STAGES.length - 1)), STAGE_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="pb-24 md:pb-16" aria-live="polite" aria-busy="true">
      <div className="page-gutter mb-8 animate-fade-up">
        <div className="relative inline-flex items-center gap-3 overflow-hidden rounded-2xl border border-brand/25 bg-brand/8 py-3 pl-3.5 pr-5">
          <span className="relative flex size-8 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <Sparkles className="size-4 animate-glow" />
          </span>
          <div className="relative h-5 min-w-[240px] overflow-hidden">
            {STAGES.map((message, index) => (
              <p
                key={message}
                className={cn(
                  'absolute inset-0 text-sm font-medium text-white transition-all duration-500 ease-out-expo',
                  index === stage ? 'translate-y-0 opacity-100' : index < stage ? '-translate-y-6 opacity-0' : 'translate-y-6 opacity-0',
                )}
              >
                {message}
              </p>
            ))}
          </div>
          <span className="ml-1 flex items-center gap-1" aria-hidden>
            {STAGES.map((_, index) => (
              <span key={index} className={cn('h-1 rounded-full transition-all duration-500', index <= stage ? 'w-4 bg-brand' : 'w-1 bg-white/20')} />
            ))}
          </span>
        </div>
      </div>

      <div className="page-gutter">
        <Skeleton className="mb-3 h-3 w-40" />
        <Skeleton className="mb-7 h-8 w-72 max-w-full" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:gap-6">
          <MovieCardSkeleton fluid className="[&>div]:rounded-3xl" />
          <MovieCardSkeleton fluid className="[&>div]:rounded-3xl" />
          <MovieCardSkeleton fluid className="hidden md:block [&>div]:rounded-3xl" />
        </div>
      </div>

      <div className="mt-12">
        <div className="page-gutter mb-4">
          <Skeleton className="h-6 w-56" />
        </div>
        <div className="no-scrollbar flex gap-3 overflow-hidden page-gutter sm:gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <MovieCardSkeleton key={index} size="lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

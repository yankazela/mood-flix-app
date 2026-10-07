'use client'

import { ArrowUpRight, Sparkles } from 'lucide-react'
import type { UserMoodId } from '@/lib/types'
import { MOVIES } from '@/lib/data/movies'
import { availableProviders } from '@/lib/recommendation/engine'
import { useDiscovery } from '@/lib/store/discovery-context'
import { usePreferences } from '@/lib/store/preferences-context'
import { MovieRow } from '@/components/movies/movie-row'

const EXAMPLES: { prompt: string; moods: UserMoodId[]; emoji: string }[] = [
  { emoji: '🛋️', prompt: 'Long day at work. I want something funny, relaxing and easy to watch.', moods: ['stressed'] },
  { emoji: '🍿', prompt: 'Saturday night with friends. Something exciting, loud and fun.', moods: ['excited'] },
  { emoji: '🕯️', prompt: 'Date night. Romantic, a little funny, nothing too heavy.', moods: ['romantic'] },
  { emoji: '🧠', prompt: 'Bored and want something smart that makes me think. A twist would be great.', moods: ['bored'] },
]

export function IdleShowcase() {
  const { rerun } = useDiscovery()
  const { preferences } = usePreferences()

  const trending = [...MOVIES]
    .filter((movie) => availableProviders(movie, preferences.country, preferences.streamingProviders).length > 0)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 12)
    .map((movie) => ({ movie }))

  const easy = MOVIES.filter((movie) => movie.emotionalProfile.intensity <= 35 && movie.rating >= 7.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 12)
    .map((movie) => ({ movie }))

  return (
    <div className="space-y-12 pb-24 md:pb-16">
      <section className="page-gutter">
        <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
          <Sparkles className="size-3.5 text-brand" /> Not sure what to say? Try one of these
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EXAMPLES.map((example, index) => (
            <button
              key={example.prompt}
              type="button"
              onClick={() => rerun(example.prompt, example.moods)}
              style={{ '--stagger-index': index + 3 } as React.CSSProperties}
              className="group flex min-h-[112px] flex-col justify-between rounded-2xl border border-white/8 bg-surface/70 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-surface-2 animate-fade-up stagger"
            >
              <span className="text-2xl" aria-hidden>
                {example.emoji}
              </span>
              <span className="mt-3 flex items-end justify-between gap-3">
                <span className="text-[13px] leading-5 text-white/75 group-hover:text-white">“{example.prompt}”</span>
                <ArrowUpRight className="size-4 shrink-0 text-white/30 transition group-hover:text-brand" />
              </span>
            </button>
          ))}
        </div>
      </section>

      <MovieRow title="Popular tonight on your services" subtitle="What people are watching right now." items={trending} cardSize="md" />
      <MovieRow title="Easy watches" subtitle="Highly rated, low effort. Perfect for a tired brain." items={easy} cardSize="md" />
    </div>
  )
}

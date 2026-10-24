'use client'

import { ArrowUpRight, Sparkles } from 'lucide-react'
import type { Movie, UserMoodId } from '@/lib/types'
import { fetchPopular } from '@/lib/api/movies'
import { useAsync } from '@/lib/hooks/use-async'
import { useDiscovery } from '@/lib/store/discovery-context'
import { usePreferences } from '@/lib/store/preferences-context'
import { MovieRow } from '@/components/movies/movie-row'

const EXAMPLES: { prompt: string; moods: UserMoodId[]; emoji: string }[] = [
  { emoji: '🛋️', prompt: 'Long day at work. I want something funny, relaxing and easy to watch.', moods: ['stressed'] },
  { emoji: '🍿', prompt: 'Saturday night with friends. Something exciting, loud and fun.', moods: ['excited'] },
  { emoji: '🕯️', prompt: 'Date night. Romantic, a little funny, nothing too heavy.', moods: ['romantic'] },
  { emoji: '🧠', prompt: 'Bored and want something smart that makes me think. A twist would be great.', moods: ['bored'] },
]

const NO_MOVIES: Movie[] = []

export function IdleShowcase() {
  const { rerun } = useDiscovery()
  const { preferences } = usePreferences()
  const services = preferences.streamingProviders

  // Titles on the user's own services; when none of them has any, fall back to everything streaming in their country.
  const trending = useAsync(
    async () => {
      const mine = services.length > 0 ? await fetchPopular({ services, limit: 12 }) : NO_MOVIES
      if (mine.length > 0) return { movies: mine, onMyServices: true }
      return { movies: await fetchPopular({ limit: 12 }), onMyServices: false }
    },
    `trending:${services.join(',')}`,
    { movies: NO_MOVIES, onMyServices: true },
  )
  const topRated = useAsync(() => fetchPopular({ sort: 'rating', limit: 12 }), 'top-rated', NO_MOVIES)

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

      <MovieRow
        title={trending.data.onMyServices && services.length > 0 ? 'Popular tonight on your services' : 'Popular tonight'}
        subtitle={trending.data.onMyServices && services.length > 0 ? 'What people are watching right now.' : 'What people are watching right now where you live.'}
        items={trending.data.movies.map((movie) => ({ movie }))}
        loading={trending.loading}
        cardSize="md"
      />
      <MovieRow
        title="Critically loved"
        subtitle="Highly rated by audiences. Reliable picks when you can’t decide."
        items={topRated.data.map((movie) => ({ movie }))}
        loading={topRated.loading}
        cardSize="md"
      />
    </div>
  )
}

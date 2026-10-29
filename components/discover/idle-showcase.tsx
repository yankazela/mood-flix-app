'use client'

import type { Movie, UserMoodId } from '@/lib/types'
import { fetchPopular } from '@/lib/api/movies'
import { getMood } from '@/lib/data/moods'
import { useAsync } from '@/lib/hooks/use-async'
import { useDiscovery } from '@/lib/store/discovery-context'
import { usePreferences } from '@/lib/store/preferences-context'
import { MovieRow } from '@/components/movies/movie-row'
import { SelectMenu, type SelectMenuOption } from '@/components/shared/select-menu'

type ExampleId = 'after-work' | 'friends' | 'date-night' | 'something-smart'

interface Example {
  id: ExampleId
  label: string
  prompt: string
  moods: UserMoodId[]
}

/** Ready-made prompts for people who do not know where to start. Each borrows the illustration of its first mood. */
const EXAMPLES: Example[] = [
  { id: 'after-work', label: 'After a long day', prompt: 'Long day at work. I want something funny, relaxing and easy to watch.', moods: ['stressed'] },
  { id: 'friends', label: 'Saturday night with friends', prompt: 'Saturday night with friends. Something exciting, loud and fun.', moods: ['excited'] },
  { id: 'date-night', label: 'Date night', prompt: 'Date night. Romantic, a little funny, nothing too heavy.', moods: ['romantic'] },
  { id: 'something-smart', label: 'Something smart', prompt: 'Bored and want something smart that makes me think. A twist would be great.', moods: ['bored'] },
]

const EXAMPLE_OPTIONS: SelectMenuOption<ExampleId>[] = EXAMPLES.map((example) => ({
  value: example.id,
  label: example.label,
  hint: `“${example.prompt}”`,
  image: getMood(example.moods[0]).image,
}))

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

  const runExample = (id: ExampleId) => {
    const example = EXAMPLES.find((candidate) => candidate.id === id)
    if (example) void rerun(example.prompt, example.moods)
  }

  return (
    <div className="space-y-12 pb-24 md:pb-16">
      <section className="page-gutter animate-fade-up stagger" style={{ '--stagger-index': 4 } as React.CSSProperties}>
        {/* Nothing stays selected: picking an example runs it, and the prompt above fills in with its words. */}
        <SelectMenu label="Example prompts" prefix="Not sure what to say?" options={EXAMPLE_OPTIONS} selected={[]} onSelect={runExample} placeholder="Try one of these" />
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

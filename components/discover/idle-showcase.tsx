'use client'

import { useLocale } from '@/lib/i18n/language-context'
import { useTranslation } from 'react-i18next'
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
  moods: UserMoodId[]
}

/** Ready-made prompts for people who do not know where to start. Each borrows the illustration of its first mood. */
const EXAMPLES: Example[] = [
  { id: 'after-work', moods: ['stressed'] },
  { id: 'friends', moods: ['excited'] },
  { id: 'date-night', moods: ['romantic'] },
  { id: 'something-smart', moods: ['bored'] },
]


const NO_MOVIES: Movie[] = []

export function IdleShowcase() {
  const { t } = useTranslation()
  // Titles and overviews come back in the interface language, so a language switch re-fetches.
  const { locale } = useLocale()
  // The example prompts are written in the interface language and sent as typed.
  const exampleOptions: SelectMenuOption<ExampleId>[] = EXAMPLES.map((example) => ({
    value: example.id,
    label: t(`data.examples.${example.id}.label`),
    hint: `“${t(`data.examples.${example.id}.prompt`)}”`,
    image: getMood(example.moods[0]).image,
  }))
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
    `trending:${locale}:${services.join(',')}`,
    { movies: NO_MOVIES, onMyServices: true },
  )
  const topRated = useAsync(() => fetchPopular({ sort: 'rating', limit: 12 }), `top-rated:${locale}`, NO_MOVIES)

  const runExample = (id: ExampleId) => {
    const example = EXAMPLES.find((candidate) => candidate.id === id)
    if (example) void rerun(t(`data.examples.${example.id}.prompt`), example.moods)
  }

  return (
    <div className="space-y-12 pb-24 md:pb-16">
      <section className="page-gutter animate-fade-up stagger" style={{ '--stagger-index': 4 } as React.CSSProperties}>
        {/* Nothing stays selected: picking an example runs it, and the prompt above fills in with its words. */}
        <SelectMenu label={t('discover.examples.label')} prefix={t('discover.examples.notSure')} options={exampleOptions} selected={[]} onSelect={runExample} placeholder={t('discover.examples.tryOne')} />
      </section>

      <MovieRow
        title={trending.data.onMyServices && services.length > 0 ? t('discover.rows.popularOnYours') : t('discover.rows.popular')}
        subtitle={trending.data.onMyServices && services.length > 0 ? t('discover.rows.popularSubOnYours') : t('discover.rows.popularSub')}
        items={trending.data.movies.map((movie) => ({ movie }))}
        loading={trending.loading}
        cardSize="md"
      />
      <MovieRow
        title={t('discover.rows.critics')}
        subtitle={t('discover.rows.criticsSub')}
        items={topRated.data.map((movie) => ({ movie }))}
        loading={topRated.loading}
        cardSize="md"
      />
    </div>
  )
}

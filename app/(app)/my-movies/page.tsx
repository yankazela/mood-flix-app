'use client'

import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import Link from 'next/link'
import { Bookmark, Eye, Heart, Sparkles } from 'lucide-react'
import { useLibrary } from '@/lib/store/library-context'
import { MovieGrid } from '@/components/movies/movie-grid'
import { SectionHeading } from '@/components/shared/section-heading'
import { buttonStyles } from '@/components/shared/button'
import { cn } from '@/lib/utils'

type Tab = 'saved' | 'liked' | 'watched'

const TABS: { id: Tab; icon: typeof Bookmark }[] = [
  { id: 'saved', icon: Bookmark },
  { id: 'liked', icon: Heart },
  { id: 'watched', icon: Eye },
]

export default function MyMoviesPage() {
  const { t } = useTranslation()
  const { savedMovies, likedMovies, watchedMovies, ready, loadError } = useLibrary()
  const [tab, setTab] = useState<Tab>('saved')

  const lists = { saved: savedMovies, liked: likedMovies, watched: watchedMovies }
  const active = TABS.find((item) => item.id === tab)!
  const movies = lists[tab]

  return (
    <div className="mx-auto max-w-[1600px] page-gutter pb-28 pt-8 sm:pt-12 md:pb-16">
      <SectionHeading size="lg" eyebrow={<><Bookmark className="size-3.5" /> {t('library.eyebrow')}</>} title={t('library.title')} subtitle={t('library.subtitle')} className="mb-8 animate-fade-up" />

      <div role="tablist" aria-label={t('library.sections')} className="mb-8 flex w-full rounded-2xl border border-white/10 bg-surface/70 p-1 animate-fade-up stagger sm:inline-flex sm:w-auto" style={{ '--stagger-index': 1 } as React.CSSProperties}>
        {TABS.map((item) => {
          const Icon = item.icon
          const selected = item.id === tab
          const count = lists[item.id].length
          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setTab(item.id)}
              className={cn(
                'flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 text-[13px] font-medium transition-all sm:flex-none sm:gap-2 sm:px-4 sm:text-sm',
                selected ? 'bg-white text-ink shadow' : 'text-white/60 hover:text-white',
              )}
            >
              <Icon className="size-4" />
              {t(`library.${item.id}`)}
              <span className={cn('rounded-full px-1.5 py-0.5 text-[11px] tabular-nums', selected ? 'bg-ink/10 text-ink/70' : 'bg-white/8 text-white/50')}>{count}</span>
            </button>
          )
        })}
      </div>

      {!ready ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-hidden>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton aspect-[2/3] rounded-2xl" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <MovieGrid key={tab} movies={movies} />
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center animate-fade-up">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <active.icon className="size-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">{t(`library.${active.id}Empty`)}</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-white/50">{loadError ? t('library.loadFailed', { detail: loadError }) : t(`library.${active.id}EmptyBody`)}</p>
          </div>
          <Link href="/" className={buttonStyles({ variant: 'secondary' })}>
            <Sparkles className="size-4" /> {t('library.discover')}
          </Link>
        </div>
      )}
    </div>
  )
}

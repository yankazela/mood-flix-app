'use client'

import { useTranslation } from 'react-i18next'
import { Info, Sparkles } from 'lucide-react'
import type { RecommendationResponse } from '@/lib/types'
import { MovieCard } from '@/components/movies/movie-card'
import { MovieRow } from '@/components/movies/movie-row'
import { SectionHeading } from '@/components/shared/section-heading'

interface MovieCatalogProps {
  response: RecommendationResponse
}

export function MovieCatalog({ response }: MovieCatalogProps) {
  const { t } = useTranslation()
  const topPicks = response.recommendations.slice(0, 3)
  const { emotion, summary, objective } = response.interpretation
  const subtitle =
    objective === 'improve'
      ? t('discover.catalog.subtitleImprove', { emotion, summary })
      : t('discover.catalog.subtitleKeep', { emotion, summary })

  if (topPicks.length === 0) {
    return (
      <section className="page-gutter pb-24">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-3xl border border-white/10 bg-surface/70 p-8 text-center animate-fade-up">
          <h2 className="text-lg font-semibold text-white">{t('discover.catalog.nothing')}</h2>
          <p className="text-sm text-white/55">{t('discover.catalog.nothingBody')}</p>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-12 pb-24 sm:space-y-14 md:pb-16">
      <section className="page-gutter">
        <SectionHeading
          size="lg"
          eyebrow={
            <>
              <Sparkles className="size-3.5" /> {t('discover.catalog.eyebrow')}
            </>
          }
          title={t('discover.catalog.title')}
          subtitle={subtitle}
          className="mb-7 animate-fade-up"
        />
        {response.notice === 'few_matches' && (
          <p role="status" className="mb-5 flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white/65 animate-fade-up">
            <Info className="mt-0.5 size-4 shrink-0 text-brand" />
            {t('discover.catalog.fewMatches')}
          </p>
        )}
        <div className="mb-4 flex items-center gap-3 animate-fade-up stagger" style={{ '--stagger-index': 1 } as React.CSSProperties}>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-brand px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-foreground">
            <Sparkles className="size-3" /> {t('discover.catalog.topPicks')}
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-brand/40 to-transparent" aria-hidden />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:gap-6">
          {topPicks.map((rec, index) => (
            <MovieCard
              key={rec.movie.id}
              movie={rec.movie}
              recommendation={rec}
              rank={index + 1}
              index={index}
              fluid
              priority
              className={index === 2 ? 'col-span-2 mx-auto max-w-[min(100%,calc(50%-0.375rem))] md:col-span-1 md:max-w-none' : undefined}
            />
          ))}
        </div>
      </section>

      {response.sections.map((section) => (
        <MovieRow
          key={section.id}
          title={section.id === 'more-for-mood' ? t('discover.catalog.moreForMood') : section.title}
          subtitle={section.id === 'more-for-mood' ? t('discover.catalog.moreForMoodSub') : section.subtitle}
          items={section.recommendations.map((rec) => ({ movie: rec.movie, recommendation: rec }))}
          cardSize={section.id === 'more-for-mood' ? 'lg' : 'md'}
        />
      ))}
    </div>
  )
}

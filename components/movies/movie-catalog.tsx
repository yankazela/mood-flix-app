'use client'

import { Sparkles } from 'lucide-react'
import type { RecommendationResponse } from '@/lib/types'
import { MovieCard } from '@/components/movies/movie-card'
import { MovieRow } from '@/components/movies/movie-row'
import { SectionHeading } from '@/components/shared/section-heading'

interface MovieCatalogProps {
  response: RecommendationResponse
}

export function MovieCatalog({ response }: MovieCatalogProps) {
  const topPicks = response.recommendations.slice(0, 3)
  const summary = response.interpretation.summary

  return (
    <div className="space-y-12 pb-24 sm:space-y-14 md:pb-16">
      <section className="page-gutter">
        <SectionHeading
          size="lg"
          eyebrow={
            <>
              <Sparkles className="size-3.5" /> Your recommendations
            </>
          }
          title="Movies for your mood"
          subtitle={`Because you’re looking for ${summary}.`}
          className="mb-7 animate-fade-up"
        />
        <div className="mb-4 flex items-center gap-3 animate-fade-up stagger" style={{ '--stagger-index': 1 } as React.CSSProperties}>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-brand px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-foreground">
            <Sparkles className="size-3" /> Top picks for you
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
          title={section.title}
          subtitle={section.subtitle}
          items={section.recommendations.map((rec) => ({ movie: rec.movie, recommendation: rec }))}
          cardSize={section.id === 'more-for-mood' ? 'lg' : 'md'}
        />
      ))}
    </div>
  )
}

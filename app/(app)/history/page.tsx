'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock3, MessageSquareQuote, Play, RotateCcw, Sparkles } from 'lucide-react'
import type { FeedbackRating, HistoryEntry } from '@/lib/types'
import { MOVIE_MAP } from '@/lib/data/movies'
import { getMood } from '@/lib/data/moods'
import { formatLongDate, formatRelativeDate, formatTime } from '@/lib/format'
import { useLibrary } from '@/lib/store/library-context'
import { useDiscovery } from '@/lib/store/discovery-context'
import { useMovieDetails } from '@/components/movies/movie-details-context'
import { PosterImage } from '@/components/movies/poster-image'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button, buttonStyles } from '@/components/shared/button'
import { cn } from '@/lib/utils'

const FEEDBACK: Record<FeedbackRating, { emoji: string; label: string }> = {
  perfect: { emoji: '😍', label: 'Perfect' },
  good: { emoji: '🙂', label: 'Good' },
  okay: { emoji: '😐', label: 'Okay' },
  'not-for-me': { emoji: '👎', label: 'Not for me' },
}

export default function HistoryPage() {
  const { history, ready } = useLibrary()

  return (
    <div className="mx-auto max-w-[1600px] page-gutter pb-28 pt-8 sm:pt-12 md:pb-16">
      <SectionHeading
        size="lg"
        eyebrow={<><Clock3 className="size-3.5" /> Recommendation history</>}
        title="How you’ve been feeling"
        subtitle="Every request, what we suggested, what you picked and how it landed. This is what trains your recommendations."
        className="mb-8 animate-fade-up"
      />

      {!ready ? null : history.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center animate-fade-up">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Clock3 className="size-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">No requests yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-white/50">Tell us how you feel on Discover and your requests will show up here.</p>
          </div>
          <Link href="/" className={buttonStyles({ variant: 'secondary' })}>
            <Sparkles className="size-4" /> Find my first movie
          </Link>
        </div>
      ) : (
        <ol className="relative space-y-5 before:absolute before:bottom-6 before:left-[15px] before:top-6 before:hidden before:w-px before:bg-white/8 md:before:block md:pl-12">
          {history.map((entry, index) => (
            <HistoryCard key={entry.id} entry={entry} index={index} />
          ))}
        </ol>
      )}
    </div>
  )
}

function HistoryCard({ entry, index }: { entry: HistoryEntry; index: number }) {
  const router = useRouter()
  const { rerun } = useDiscovery()
  const { open } = useMovieDetails()
  const recommended = entry.recommendedMovieIds.map((id) => MOVIE_MAP[id]).filter(Boolean)
  const selected = entry.selectedMovieId ? MOVIE_MAP[entry.selectedMovieId] : undefined
  const feedback = entry.feedback ? FEEDBACK[entry.feedback] : null

  const runAgain = () => {
    void rerun(entry.prompt, entry.moods)
    router.push('/')
  }

  return (
    <li className="relative animate-fade-up stagger" style={{ '--stagger-index': Math.min(index, 8) } as React.CSSProperties}>
      <span className="absolute -left-12 top-6 hidden size-[31px] items-center justify-center rounded-full border border-white/10 bg-surface-2 text-xs md:flex" aria-hidden>
        {entry.moods[0] ? getMood(entry.moods[0]).emoji : '✨'}
      </span>
      <article className="overflow-hidden rounded-3xl border border-white/8 bg-surface/70 transition hover:border-white/15">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/45">
              <time dateTime={entry.createdAt} title={formatLongDate(entry.createdAt)} className="font-medium text-white/70">
                {formatRelativeDate(entry.createdAt)}
              </time>
              <span>{formatTime(entry.createdAt)}</span>
              <span>·</span>
              <span className="truncate">Wanted {entry.interpretation.summary}</span>
            </div>
            <blockquote className="mt-3 flex gap-3">
              <MessageSquareQuote className="mt-1 size-5 shrink-0 text-brand" aria-hidden />
              <p className="text-lg font-medium leading-snug tracking-[-0.01em] text-white text-pretty sm:text-xl">“{entry.prompt}”</p>
            </blockquote>
            {entry.moods.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Moods">
                {entry.moods.map((id) => {
                  const mood = getMood(id)
                  return (
                    <li key={id} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-2.5 text-xs text-white/70">
                      <span aria-hidden>{mood.emoji}</span> {mood.label}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3 lg:flex-col lg:items-end">
            {feedback ? (
              <span className="inline-flex h-9 items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 text-sm font-medium text-brand">
                <span aria-hidden>{feedback.emoji}</span> {feedback.label}
              </span>
            ) : (
              <span className="inline-flex h-9 items-center rounded-full border border-white/10 px-3 text-sm text-white/45">No feedback yet</span>
            )}
            <Button variant="secondary" size="sm" onClick={runAgain} leadingIcon={<RotateCcw />}>
              Run again
            </Button>
          </div>
        </div>

        <div className="grid gap-5 border-t border-white/6 p-5 sm:grid-cols-[1fr_auto] sm:p-6">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Movies recommended</p>
            <ul className="flex gap-2.5 overflow-x-auto no-scrollbar">
              {recommended.map((movie) => (
                <li key={movie.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => open(movie)}
                    className={cn('block w-[72px] overflow-hidden rounded-xl ring-1 ring-white/10 transition hover:scale-[1.04] hover:ring-white/30 sm:w-[84px]', selected?.id === movie.id && 'ring-2 ring-brand')}
                    aria-label={`View ${movie.title}`}
                  >
                    <PosterImage movie={movie} size="w185" className="aspect-[2/3]" sizes="84px" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="sm:w-[260px] sm:border-l sm:border-white/6 sm:pl-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Movie selected</p>
            {selected ? (
              <button type="button" onClick={() => open(selected)} className="group flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-surface-2/60 p-2.5 text-left transition hover:border-white/20">
                <PosterImage movie={selected} size="w185" className="aspect-[2/3] w-11 shrink-0 rounded-lg" sizes="44px" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{selected.title}</span>
                  <span className="block text-xs text-white/45">{selected.releaseYear}</span>
                </span>
                <Play className="size-4 shrink-0 text-white/35 transition group-hover:text-brand" />
              </button>
            ) : (
              <p className="text-sm text-white/45">You didn’t pick one this time.</p>
            )}
          </div>
        </div>
      </article>
    </li>
  )
}

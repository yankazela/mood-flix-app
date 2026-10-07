'use client'

import { Bookmark, BookmarkCheck, Check, Eye, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { FeedbackRating, Movie } from '@/lib/types'
import { useLibrary } from '@/lib/store/library-context'
import { useMovieActions } from '@/lib/hooks/use-movie-actions'
import { useToast } from '@/components/shared/toast'
import { cn } from '@/lib/utils'

interface FeedbackPanelProps {
  movie: Movie
  recommendationId?: string
  historyId?: string | null
  className?: string
}

const RATINGS: { value: FeedbackRating; emoji: string; label: string }[] = [
  { value: 'perfect', emoji: '😍', label: 'Perfect' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'not-for-me', emoji: '👎', label: 'Not for me' },
]

export function FeedbackPanel({ movie, recommendationId, historyId, className }: FeedbackPanelProps) {
  const library = useLibrary()
  const toast = useToast()
  const { feedback, saved, liked, disliked, watched, toggleSaved, like, dislike, toggleWatched } = useMovieActions(movie)
  const current = feedback?.rating

  const rate = (rating: FeedbackRating) => {
    library.rateMovie(movie.id, rating, recommendationId)
    if (historyId) library.recordHistoryFeedback(historyId, rating)
    toast.show('Thanks! This helps us learn your taste.', 'success')
  }

  return (
    <section className={cn('rounded-3xl border border-white/8 bg-surface p-5 sm:p-6', className)}>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-white">Was this a good recommendation?</h3>
          <p className="mt-1 text-sm text-white/45">Your feedback trains your personal recommendation engine.</p>
          <div className="mt-4 grid grid-cols-4 gap-2 sm:flex sm:flex-wrap">
            {RATINGS.map((option) => {
              const active = current === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => rate(option.value)}
                  aria-pressed={active}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-xs font-medium transition-all sm:min-w-[92px] sm:flex-row sm:gap-2 sm:py-2.5 sm:text-sm',
                    active
                      ? 'border-brand bg-brand text-brand-foreground shadow-[0_8px_30px_-12px_rgba(217,246,107,0.7)]'
                      : 'border-white/10 bg-white/4 text-white/75 hover:border-white/20 hover:bg-white/8 hover:text-white',
                  )}
                >
                  <span className="text-xl leading-none sm:text-lg" aria-hidden>
                    {option.emoji}
                  </span>
                  {option.label}
                  {active && <Check className="hidden size-3.5 sm:block" strokeWidth={3} />}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:max-w-[280px] md:justify-end">
          <ToggleChip active={liked} onClick={like} icon={<ThumbsUp className="size-3.5" />} label="Like" />
          <ToggleChip active={disliked} onClick={dislike} icon={<ThumbsDown className="size-3.5" />} label="Dislike" />
          <ToggleChip active={watched} onClick={toggleWatched} icon={<Eye className="size-3.5" />} label="Already watched" />
          <ToggleChip
            active={saved}
            onClick={toggleSaved}
            icon={saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
            label={saved ? 'Saved' : 'Save for later'}
          />
        </div>
      </div>
    </section>
  )
}

function ToggleChip({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all',
        active ? 'border-brand/60 bg-brand/15 text-brand' : 'border-white/10 bg-white/4 text-white/70 hover:border-white/20 hover:text-white',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

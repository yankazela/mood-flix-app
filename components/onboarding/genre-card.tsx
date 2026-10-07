'use client'

import { Check } from 'lucide-react'
import type { GenreOption } from '@/lib/data/genres'
import { cn } from '@/lib/utils'

interface GenreCardProps {
  genre: GenreOption
  selected: boolean
  onToggle: () => void
  index?: number
}

export function GenreCard({ genre, selected, onToggle, index = 0 }: GenreCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      style={{ '--stagger-index': index } as React.CSSProperties}
      className={cn(
        'group relative flex min-h-[112px] flex-col justify-between overflow-hidden rounded-3xl border p-4 text-left transition-all duration-300 ease-out-expo animate-fade-up stagger sm:min-h-[128px] sm:p-5',
        'outline-none focus-visible:ring-2 focus-visible:ring-brand/70 active:scale-[0.98]',
        selected
          ? 'border-brand/60 bg-brand/12 shadow-[0_20px_60px_-28px_rgba(217,246,107,0.7)]'
          : 'border-white/8 bg-surface/70 hover:-translate-y-0.5 hover:border-white/20 hover:bg-surface-2',
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl leading-none" aria-hidden>
          {genre.emoji}
        </span>
        <span
          className={cn(
            'flex size-6 items-center justify-center rounded-full border transition-all duration-300',
            selected ? 'scale-100 border-brand bg-brand text-brand-foreground' : 'scale-90 border-white/20 text-transparent group-hover:border-white/40',
          )}
          aria-hidden
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      </div>
      <div>
        <p className={cn('text-[15px] font-semibold', selected ? 'text-brand' : 'text-white')}>{genre.label}</p>
        <p className="mt-0.5 text-xs text-white/45">{genre.blurb}</p>
      </div>
    </button>
  )
}

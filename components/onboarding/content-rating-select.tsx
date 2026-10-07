'use client'

import { Check, Shield } from 'lucide-react'
import type { ContentRating } from '@/lib/types'
import { CONTENT_RATINGS } from '@/lib/data/content-ratings'
import { cn } from '@/lib/utils'

interface ContentRatingSelectProps {
  value: ContentRating
  onChange: (rating: ContentRating) => void
}

/** Single-select ladder: "show me films rated up to …". */
export function ContentRatingSelect({ value, onChange }: ContentRatingSelectProps) {
  return (
    <div role="radiogroup" aria-label="Maximum content rating" className="grid gap-3 sm:grid-cols-2">
      {CONTENT_RATINGS.map((option, index) => {
        const selected = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            style={{ '--stagger-index': index } as React.CSSProperties}
            className={cn(
              'group flex items-center gap-4 rounded-3xl border p-4 text-left transition-all duration-300 ease-out-expo animate-fade-up stagger sm:p-5',
              'outline-none focus-visible:ring-2 focus-visible:ring-brand/70 active:scale-[0.99]',
              selected
                ? 'border-brand/60 bg-brand/12 shadow-[0_20px_60px_-28px_rgba(217,246,107,0.7)]'
                : 'border-white/8 bg-surface/70 hover:border-white/20 hover:bg-surface-2',
            )}
          >
            <span
              className={cn(
                'flex h-14 w-16 shrink-0 items-center justify-center rounded-2xl border-2 text-base font-black tracking-tight transition-colors',
                selected ? 'border-brand bg-brand text-brand-foreground' : 'border-white/15 text-white/80 group-hover:border-white/30',
              )}
              aria-hidden
            >
              {option.id}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className={cn('text-[15px] font-semibold', selected ? 'text-brand' : 'text-white')}>Up to {option.id} · {option.title}</span>
              </span>
              <span className="mt-0.5 block text-sm text-white/50">{option.description}</span>
            </span>
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                selected ? 'border-brand bg-brand text-brand-foreground' : 'border-white/20 text-transparent',
              )}
              aria-hidden
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
          </button>
        )
      })}
      <p className="flex items-start gap-2 text-xs leading-5 text-white/40 sm:col-span-2">
        <Shield className="mt-0.5 size-3.5 shrink-0 text-brand" />
        We’ll keep anything above your limit out of your recommendations. You can change this any time from your profile.
      </p>
    </div>
  )
}

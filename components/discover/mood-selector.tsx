'use client'

import type { UserMoodId } from '@/lib/types'
import { USER_MOODS } from '@/lib/data/moods'
import { cn } from '@/lib/utils'

interface MoodSelectorProps {
  selected: UserMoodId[]
  onToggle: (mood: UserMoodId) => void
  disabled?: boolean
  className?: string
}

export function MoodSelector({ selected, onToggle, disabled = false, className }: MoodSelectorProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} role="group" aria-label="Quick moods">
      <span className="mr-1 text-xs text-white/35">I’m feeling</span>
      {USER_MOODS.map((mood, index) => {
        const active = selected.includes(mood.id)
        return (
          <button
            key={mood.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(mood.id)}
            aria-pressed={active}
            style={{ '--stagger-index': index } as React.CSSProperties}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-all duration-200 animate-fade-up stagger',
              'outline-none focus-visible:ring-2 focus-visible:ring-brand/70 active:scale-95 disabled:opacity-50',
              active
                ? 'border-brand/60 bg-brand/15 text-brand shadow-[0_0_0_1px_rgba(217,246,107,0.2)]'
                : 'border-white/10 bg-white/4 text-white/60 hover:border-white/20 hover:bg-white/8 hover:text-white',
            )}
          >
            <span aria-hidden className="text-base leading-none">
              {mood.emoji}
            </span>
            {mood.label}
          </button>
        )
      })}
    </div>
  )
}

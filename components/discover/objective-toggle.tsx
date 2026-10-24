'use client'

import { Sparkles, Waves } from 'lucide-react'
import type { MoodObjective } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ObjectiveToggleProps {
  value: MoodObjective
  onChange: (value: MoodObjective) => void
  disabled?: boolean
  className?: string
}

const OPTIONS: { value: MoodObjective; label: string; hint: string; icon: typeof Waves }[] = [
  { value: 'keep', label: 'Match my mood', hint: 'Something that sits with how I feel', icon: Waves },
  { value: 'improve', label: 'Lift my mood', hint: 'Something that brightens it', icon: Sparkles },
]

/** Whether recommendations should meet the mood the user is in, or nudge it somewhere better. */
export function ObjectiveToggle({ value, onChange, disabled = false, className }: ObjectiveToggleProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} role="radiogroup" aria-label="What should the pick do for your mood?">
      <span className="mr-1 text-xs text-white/35">I’d like something to</span>
      {OPTIONS.map((option) => {
        const Icon = option.icon
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            title={option.hint}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-all duration-200',
              'outline-none focus-visible:ring-2 focus-visible:ring-brand/70 active:scale-95 disabled:opacity-50',
              active
                ? 'border-brand/60 bg-brand/15 text-brand shadow-[0_0_0_1px_rgba(217,246,107,0.2)]'
                : 'border-white/10 bg-white/4 text-white/60 hover:border-white/20 hover:bg-white/8 hover:text-white',
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

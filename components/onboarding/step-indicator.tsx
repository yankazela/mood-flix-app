'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OnboardingStepMeta {
  id: string
  label: string
}

interface StepIndicatorProps {
  steps: OnboardingStepMeta[]
  current: number
  /** Allow jumping between steps (used when editing preferences later). */
  onSelect?: (index: number) => void
}

export function StepIndicator({ steps, current, onSelect }: StepIndicatorProps) {
  return (
    <ol className="flex items-center gap-2" aria-label="Setup progress">
      {steps.map((step, index) => {
        const done = index < current
        const active = index === current
        const content = (
          <>
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                done ? 'bg-brand text-brand-foreground' : active ? 'bg-white text-ink' : 'bg-white/10 text-white/50',
              )}
              aria-hidden
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>
            <span className={cn('hidden text-xs font-medium sm:inline', active ? 'text-white' : done ? 'text-white/70' : 'text-white/40')}>{step.label}</span>
          </>
        )
        return (
          <li key={step.id} className="flex items-center gap-2">
            {onSelect ? (
              <button type="button" onClick={() => onSelect(index)} aria-current={active ? 'step' : undefined} className="flex items-center gap-2 rounded-full py-1 pr-2 outline-none focus-visible:ring-2 focus-visible:ring-brand/70">
                {content}
              </button>
            ) : (
              <span className="flex items-center gap-2" aria-current={active ? 'step' : undefined}>
                {content}
              </span>
            )}
            {index < steps.length - 1 && <span className={cn('h-px w-6 sm:w-10', done ? 'bg-brand/60' : 'bg-white/10')} aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}

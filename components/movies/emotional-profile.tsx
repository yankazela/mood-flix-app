'use client'

import type { EmotionalAxis, EmotionalProfile as EmotionalProfileType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EmotionalProfileProps {
  profile: EmotionalProfileType
  compact?: boolean
  className?: string
}

const AXES: { key: EmotionalAxis; label: string }[] = [
  { key: 'funny', label: 'Funny' },
  { key: 'comforting', label: 'Comforting' },
  { key: 'exciting', label: 'Exciting' },
  { key: 'dark', label: 'Dark' },
  { key: 'romantic', label: 'Romantic' },
  { key: 'intensity', label: 'Intensity' },
]

export function EmotionalProfile({ profile, compact = false, className }: EmotionalProfileProps) {
  return (
    <dl className={cn('space-y-3', compact && 'space-y-2', className)}>
      {AXES.map(({ key, label }, index) => {
        const value = Math.round(profile[key])
        return (
          <div key={key} className="animate-fade-up stagger" style={{ '--stagger-index': index } as React.CSSProperties}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <dt className="font-medium text-white/70">{label}</dt>
              <dd className="tabular-nums text-white/50">{value}%</dd>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
              <div
                className={cn('h-full rounded-full transition-[width] duration-1000 ease-out-expo', value >= 60 ? 'bg-brand' : 'bg-white/35')}
                style={{ width: `${value}%`, transitionDelay: `${index * 70}ms` }}
              />
            </div>
          </div>
        )
      })}
    </dl>
  )
}

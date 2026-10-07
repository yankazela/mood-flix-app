'use client'

import { Check } from 'lucide-react'
import type { StreamingProvider } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProviderCardProps {
  provider: StreamingProvider
  selected: boolean
  onToggle: () => void
  index?: number
  unavailable?: boolean
}

export function ProviderCard({ provider, selected, onToggle, index = 0, unavailable = false }: ProviderCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      style={{ '--stagger-index': index, '--brand': provider.brandColor } as React.CSSProperties}
      className={cn(
        'group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-3xl border p-4 text-left transition-all duration-300 ease-out-expo animate-fade-up stagger sm:aspect-[5/4] sm:p-5',
        'outline-none focus-visible:ring-2 focus-visible:ring-brand/70 active:scale-[0.98]',
        selected ? 'border-white/30 bg-surface-2 shadow-[0_20px_60px_-24px_var(--brand)]' : 'border-white/8 bg-surface/70 hover:-translate-y-0.5 hover:border-white/20 hover:bg-surface-2',
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-50" style={{ backgroundColor: provider.brandColor, opacity: selected ? 0.55 : undefined }} aria-hidden />
      <div className="flex items-start justify-between">
        <span className="flex h-10 items-center rounded-xl px-3 text-sm font-extrabold tracking-tight" style={{ backgroundColor: provider.brandColor, color: provider.textColor }}>
          {provider.shortName}
        </span>
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-full border transition-all duration-300',
            selected ? 'scale-100 border-brand bg-brand text-brand-foreground' : 'scale-90 border-white/20 text-transparent group-hover:border-white/40',
          )}
          aria-hidden
        >
          <Check className="size-4" strokeWidth={3} />
        </span>
      </div>
      <div>
        <p className="text-base font-semibold text-white">{provider.name}</p>
        <p className="mt-0.5 text-xs text-white/45">{unavailable ? 'Not available in your region' : selected ? 'Included in your results' : 'Tap to add'}</p>
      </div>
    </button>
  )
}

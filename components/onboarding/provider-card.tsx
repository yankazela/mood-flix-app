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
  const status = unavailable ? 'Not available in your region' : selected ? 'Included in your results' : 'Tap to add'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      style={{ '--stagger-index': index, '--brand': provider.brandColor, '--glow': selected ? 0.45 : 0.2 } as React.CSSProperties}
      className={cn(
        // Height follows the content, so the status line is never cut off on narrow phones.
        'group relative flex min-h-[124px] flex-col justify-between gap-3 overflow-hidden rounded-3xl border p-3 text-left transition-all duration-300 ease-out-expo animate-fade-up stagger sm:min-h-[148px] sm:p-5',
        'outline-none focus-visible:ring-2 focus-visible:ring-brand/70 active:scale-[0.98]',
        selected ? 'border-white/30 bg-surface-2 shadow-[0_20px_60px_-24px_var(--brand)]' : 'border-white/8 bg-surface/70 hover:-translate-y-0.5 hover:border-white/20 hover:bg-surface-2',
      )}
    >
      {/* Brand glow as a gradient rather than a blur filter, which mobile WebViews composite badly. */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-[var(--glow)] transition-opacity duration-500 group-hover:opacity-50"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-2">
        {/* The pill may shrink and truncate; the check never does, so the two cannot overlap. */}
        <span
          className="flex h-9 min-w-0 items-center rounded-xl px-2.5 text-xs font-extrabold tracking-tight sm:h-10 sm:px-3 sm:text-sm"
          style={{ backgroundColor: provider.brandColor, color: provider.textColor }}
        >
          <span className="truncate">{provider.shortName}</span>
        </span>
        <span
          className={cn(
            'flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 sm:size-7',
            selected ? 'scale-100 border-brand bg-brand text-brand-foreground' : 'scale-90 border-white/20 text-transparent group-hover:border-white/40',
          )}
          aria-hidden
        >
          <Check className="size-3.5 sm:size-4" strokeWidth={3} />
        </span>
      </div>
      <div className="relative min-w-0">
        <p className="text-[15px] font-semibold leading-5 text-white sm:text-base">{provider.name}</p>
        <p className="mt-0.5 text-xs leading-4 text-white/45">{status}</p>
      </div>
    </button>
  )
}

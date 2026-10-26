'use client'

import { Sparkles } from 'lucide-react'
import { formatResetsIn } from '@/lib/billing/format'
import { useBilling } from '@/lib/store/billing-context'
import { cn } from '@/lib/utils'

/** How many picks are left today, with the way up for people on the free plan. */
export function UsagePill({ className }: { className?: string }) {
  const { usage, plan, openPaywall } = useBilling()
  if (!usage) return null
  const exhausted = usage.remaining <= 0

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
        exhausted ? 'border-brand/30 bg-brand/10 text-white/80' : 'border-white/10 bg-white/5 text-white/60',
        className,
      )}
    >
      <Sparkles className="size-3 text-brand" aria-hidden />
      <span>{exhausted ? `Picks reset ${formatResetsIn(usage.resetsAt)}` : `${usage.remaining}/${usage.limit} picks left today`}</span>
      {plan === 'free' && (
        <button type="button" onClick={openPaywall} className="font-semibold text-brand outline-none hover:underline focus-visible:underline">
          Upgrade
        </button>
      )}
    </span>
  )
}

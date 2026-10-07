import { Sparkles } from 'lucide-react'
import type { Recommendation } from '@/lib/types'
import { cn } from '@/lib/utils'

interface RecommendationReasonProps {
  recommendation: Recommendation
  className?: string
}

export function RecommendationReason({ recommendation, className }: RecommendationReasonProps) {
  return (
    <section className={cn('relative overflow-hidden rounded-2xl border border-brand/25 bg-brand/8 p-5 sm:p-6', className)}>
      <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-brand/15 blur-3xl" aria-hidden />
      <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
        <Sparkles className="size-3.5" /> Why we picked this for you
      </h3>
      <p className="mt-3 text-[15px] leading-7 text-white/85 text-pretty">{recommendation.reason}</p>
      {recommendation.highlights.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {recommendation.highlights.map((highlight) => (
            <li key={highlight} className="rounded-full border border-white/10 bg-ink/40 px-2.5 py-1 text-xs text-white/70">
              {highlight}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

import type { Plan } from '@/lib/types'
import { cn } from '@/lib/utils'

export function PlanBadge({ plan, className }: { plan: Plan; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]',
        plan === 'advanced' ? 'bg-brand text-brand-foreground' : 'bg-white/10 text-white/60',
        className,
      )}
    >
      {plan === 'advanced' ? 'Advanced' : 'Free'}
    </span>
  )
}

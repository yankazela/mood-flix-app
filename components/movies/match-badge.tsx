import { cn } from '@/lib/utils'

interface MatchBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function MatchBadge({ score, size = 'sm', className }: MatchBadgeProps) {
  const strong = score >= 90
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold tabular-nums tracking-tight whitespace-nowrap',
        size === 'sm' && 'h-6 px-2 text-[11px]',
        size === 'md' && 'h-7 px-2.5 text-xs',
        size === 'lg' && 'h-9 px-3.5 text-sm',
        strong ? 'bg-brand text-brand-foreground' : 'border border-brand/40 bg-brand/15 text-brand',
        className,
      )}
      aria-label={`${score} percent match`}
    >
      {score}% match
    </span>
  )
}

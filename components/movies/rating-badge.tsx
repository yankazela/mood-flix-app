import { Star } from 'lucide-react'
import { formatRating } from '@/lib/format'
import { cn } from '@/lib/utils'

interface RatingBadgeProps {
  rating: number
  voteCount?: number
  size?: 'sm' | 'md'
  className?: string
}

export function RatingBadge({ rating, voteCount, size = 'sm', className }: RatingBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold tabular-nums text-white/90',
        size === 'sm' ? 'text-[11px]' : 'text-sm',
        className,
      )}
      title={voteCount ? `${formatRating(rating)} from ${voteCount.toLocaleString()} ratings` : `Rated ${formatRating(rating)}`}
    >
      <Star className={cn('fill-brand text-brand', size === 'sm' ? 'size-3' : 'size-4')} />
      {formatRating(rating)}
      {voteCount && size === 'md' && <span className="ml-1 font-normal text-white/40">({(voteCount / 1000).toFixed(1)}k)</span>}
    </span>
  )
}

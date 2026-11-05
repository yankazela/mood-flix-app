'use client'

import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { formatNumber, formatRating } from '@/lib/format'
import { regionalTag } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface RatingBadgeProps {
  rating: number
  voteCount?: number
  size?: 'sm' | 'md'
  className?: string
}

export function RatingBadge({ rating, voteCount, size = 'sm', className }: RatingBadgeProps) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold tabular-nums text-white/90',
        size === 'sm' ? 'text-[11px]' : 'text-sm',
        className,
      )}
      title={voteCount ? t('movie.ratingsTitle', { rating: formatRating(rating), votes: formatNumber(voteCount) }) : t('movie.ratedTitle', { rating: formatRating(rating) })}
    >
      <Star className={cn('fill-brand text-brand', size === 'sm' ? 'size-3' : 'size-4')} />
      {formatRating(rating)}
      {voteCount && size === 'md' && <span className="ml-1 font-normal text-white/40">({new Intl.NumberFormat(regionalTag(), { notation: 'compact', maximumFractionDigits: 1 }).format(voteCount)})</span>}
    </span>
  )
}

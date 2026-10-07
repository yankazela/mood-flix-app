import type { StreamingProviderId } from '@/lib/types'
import { getProvider } from '@/lib/data/providers'
import { cn } from '@/lib/utils'

interface StreamingProviderBadgeProps {
  providerId: StreamingProviderId
  size?: 'xs' | 'sm' | 'md'
  /** `solid` fills with the brand colour; `subtle` shows a coloured dot on glass. */
  variant?: 'solid' | 'subtle'
  className?: string
}

const SIZES = {
  xs: 'h-5 px-1.5 text-[10px] gap-1',
  sm: 'h-6 px-2 text-[11px] gap-1.5',
  md: 'h-8 px-3 text-xs gap-2',
}

export function StreamingProviderBadge({ providerId, size = 'sm', variant = 'subtle', className }: StreamingProviderBadgeProps) {
  const provider = getProvider(providerId)
  if (!provider) return null

  if (variant === 'solid') {
    return (
      <span
        className={cn('inline-flex items-center rounded-md font-semibold tracking-tight whitespace-nowrap', SIZES[size], className)}
        style={{ backgroundColor: provider.brandColor, color: provider.textColor }}
        title={`Available on ${provider.name}`}
      >
        {provider.shortName}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-white/10 bg-black/45 font-medium text-white/90 backdrop-blur-md whitespace-nowrap',
        SIZES[size],
        className,
      )}
      title={`Available on ${provider.name}`}
    >
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: provider.brandColor }} aria-hidden />
      {provider.shortName}
    </span>
  )
}

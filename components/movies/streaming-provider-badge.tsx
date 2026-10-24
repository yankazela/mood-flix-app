import type { ServiceRef } from '@/lib/types'
import { getProvider } from '@/lib/data/providers'
import { cn } from '@/lib/utils'

interface StreamingProviderBadgeProps {
  service: ServiceRef
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

/** A service chip. Services the app knows get their brand colours; any other service the catalogue names gets a neutral chip. */
export function StreamingProviderBadge({ service, size = 'sm', variant = 'subtle', className }: StreamingProviderBadgeProps) {
  const provider = service.providerId ? getProvider(service.providerId) : undefined
  const label = provider?.shortName ?? service.name
  const title = `Available on ${provider?.name ?? service.name}`

  if (variant === 'solid') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-md font-semibold tracking-tight whitespace-nowrap',
          !provider && 'border border-white/15 bg-white/10 text-white/85',
          SIZES[size],
          className,
        )}
        style={provider ? { backgroundColor: provider.brandColor, color: provider.textColor } : undefined}
        title={title}
      >
        {label}
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
      title={title}
    >
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: provider?.brandColor ?? '#9ca3af' }} aria-hidden />
      {label}
    </span>
  )
}

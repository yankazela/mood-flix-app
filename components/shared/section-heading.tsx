import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  title: ReactNode
  subtitle?: ReactNode
  eyebrow?: ReactNode
  action?: ReactNode
  size?: 'md' | 'lg'
  className?: string
}

export function SectionHeading({ title, subtitle, eyebrow, action, size = 'md', className }: SectionHeadingProps) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">{eyebrow}</p>
        )}
        <h2
          className={cn(
            'font-medium tracking-[-0.035em] text-white text-balance',
            size === 'lg' ? 'text-2xl sm:text-3xl lg:text-[2rem]' : 'text-lg sm:text-xl',
          )}
        >
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-white/45 text-pretty">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

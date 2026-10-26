import 'flag-icons/css/flag-icons.min.css'
import { cn } from '@/lib/utils'

interface FlagProps {
  /** ISO 3166-1 alpha-2, any case. */
  code: string
  /** Read out by screen readers; without it the flag is decorative and hidden from them. */
  label?: string
  /** Size it with a text size class; the flag is 4:3 and scales with the font size. */
  className?: string
}

/** A country flag from flag-icons. The only way flags are drawn in the app, so they look the same on every platform. */
export function Flag({ code, label, className }: FlagProps) {
  return (
    <span
      className={cn('fi inline-block shrink-0 overflow-hidden rounded-[3px] align-[-0.1em] shadow-[0_0_0_1px_rgba(255,255,255,0.12)]', `fi-${code.toLowerCase()}`, className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}

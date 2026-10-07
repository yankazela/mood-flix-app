import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Hide the wordmark and only show the mark. */
  markOnly?: boolean
}

const SIZES = {
  sm: { box: 'size-7 rounded-lg', icon: 'size-3.5', text: 'text-base' },
  md: { box: 'size-8 rounded-xl', icon: 'size-4', text: 'text-xl' },
  lg: { box: 'size-11 rounded-2xl', icon: 'size-5', text: 'text-2xl' },
} as const

export function Logo({ href = '/', size = 'md', className, markOnly = false }: LogoProps) {
  const sizes = SIZES[size]
  const content = (
    <>
      <span className={cn('flex shrink-0 items-center justify-center bg-brand text-brand-foreground', sizes.box)}>
        <Sparkles className={sizes.icon} strokeWidth={2.4} />
      </span>
      {!markOnly && <span className={cn('font-semibold tracking-[-0.045em] text-white', sizes.text)}>moodflix</span>}
    </>
  )
  const classes = cn('flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-brand/60 rounded-xl', className)
  if (!href) return <div className={classes}>{content}</div>
  return (
    <Link href={href} className={classes} aria-label="MoodFlix home">
      {content}
    </Link>
  )
}

import { cn } from '@/lib/utils'

/**
 * Framework-agnostic button class builder. Lives outside the 'use client'
 * boundary so Server Components (e.g. not-found.tsx) can style <Link>s.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-foreground hover:brightness-105 active:brightness-95 shadow-[0_8px_30px_-12px_rgba(217,246,107,0.6)]',
  secondary: 'bg-white/8 text-white hover:bg-white/12 border border-white/10',
  ghost: 'text-white/70 hover:text-white hover:bg-white/8',
  outline: 'border border-white/15 text-white hover:bg-white/6 hover:border-white/25',
  danger: 'bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/20',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-xl [&_svg]:size-3.5',
  md: 'h-11 px-4.5 text-sm gap-2 rounded-xl [&_svg]:size-4',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-2xl [&_svg]:size-4',
  xl: 'h-14 px-7 text-base gap-2.5 rounded-2xl [&_svg]:size-5',
}

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    'inline-flex shrink-0 select-none items-center justify-center font-semibold tracking-tight whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
    VARIANTS[variant],
    SIZES[size],
    className,
  )
}

'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'glass' | 'solid' | 'ghost' | 'brand'
  active?: boolean
}

const SIZES = { sm: 'size-8 [&_svg]:size-3.5', md: 'size-10 [&_svg]:size-4', lg: 'size-12 [&_svg]:size-5' }

const VARIANTS = {
  glass: 'glass text-white/80 hover:text-white hover:bg-white/10',
  solid: 'bg-surface-2 text-white/80 hover:bg-surface-3 hover:text-white border border-line',
  ghost: 'text-white/60 hover:text-white hover:bg-white/8',
  brand: 'bg-brand text-brand-foreground hover:brightness-105',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = 'md', variant = 'glass', active = false, className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand/70 active:scale-95 disabled:pointer-events-none disabled:opacity-40',
        SIZES[size],
        VARIANTS[variant],
        active && 'bg-brand text-brand-foreground hover:bg-brand hover:text-brand-foreground border-brand',
        className,
      )}
      {...props}
    />
  )
})

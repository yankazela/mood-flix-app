'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { buttonStyles, type ButtonSize, type ButtonVariant } from '@/components/shared/button-styles'
import { cn } from '@/lib/utils'

export { buttonStyles, type ButtonSize, type ButtonVariant }

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, loading = false, leadingIcon, trailingIcon, fullWidth = false, className, children, disabled, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonStyles({ variant, size }), fullWidth && 'w-full', className)}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  )
})

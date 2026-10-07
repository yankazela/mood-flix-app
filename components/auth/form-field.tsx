'use client'

import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: ReactNode
  trailing?: ReactNode
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField({ label, error, hint, trailing, className, id, ...props }, ref) {
  const generated = useId()
  const fieldId = id ?? generated
  const errorId = `${fieldId}-error`
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={fieldId} className="text-[13px] font-medium text-white/80">
          {label}
        </label>
        {hint && <span className="text-xs text-white/45">{hint}</span>}
      </div>
      <div className="relative">
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'h-12 w-full rounded-xl border bg-white/4 px-4 text-[15px] text-white outline-none transition-all placeholder:text-white/30',
            'focus:border-brand/60 focus:bg-white/6 focus:ring-4 focus:ring-brand/10',
            error ? 'border-destructive/60' : 'border-white/10 hover:border-white/20',
            trailing && 'pr-12',
            className,
          )}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>}
      </div>
      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-xs text-destructive animate-fade-in">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
    </div>
  )
})

type PasswordInputProps = Omit<FormFieldProps, 'type' | 'trailing'>

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false)
  return (
    <FormField
      ref={ref}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="flex size-9 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/8 hover:text-white"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
      {...props}
    />
  )
})

export function PasswordStrength({ password }: { password: string }) {
  const score = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length
  const label = password.length === 0 ? '' : score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong'
  if (!password) return null
  return (
    <div className="flex items-center gap-2 animate-fade-in" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((index) => (
          <span key={index} className={cn('h-1 flex-1 rounded-full transition-colors', index < score ? (score <= 1 ? 'bg-destructive' : score === 2 ? 'bg-amber-400' : 'bg-brand') : 'bg-white/10')} />
        ))}
      </div>
      <span className="w-12 text-right text-[11px] text-white/50">{label}</span>
    </div>
  )
}

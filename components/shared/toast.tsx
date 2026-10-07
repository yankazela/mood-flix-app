'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Check, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastTone = 'default' | 'success'

interface Toast {
  id: number
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_MS = 2800

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
  }, [])

  const show = useCallback(
    (message: string, tone: ToastTone = 'default') => {
      const id = ++counter.current
      setToasts((current) => [...current.slice(-2), { id, message, tone }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), TOAST_MS),
      )
    },
    [dismiss],
  )

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => clearTimeout(timer))
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-[90] flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-surface-2/95 py-2.5 pl-3.5 pr-2 text-sm text-white shadow-2xl backdrop-blur-xl animate-fade-up',
            )}
          >
            <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full', toast.tone === 'success' ? 'bg-brand text-brand-foreground' : 'bg-white/10 text-white/80')}>
              {toast.tone === 'success' ? <Check className="size-3.5" strokeWidth={3} /> : <Info className="size-3.5" />}
            </span>
            <span className="leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="ml-1 flex size-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within <ToastProvider>')
  return context
}

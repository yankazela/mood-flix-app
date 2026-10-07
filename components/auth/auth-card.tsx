import type { ReactNode } from 'react'
import { Logo } from '@/components/shared/logo'

interface AuthCardProps {
  title: string
  subtitle: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-[440px] animate-fade-up">
      <div className="mb-8 flex justify-center lg:hidden">
        <Logo size="lg" href="" />
      </div>
      <div className="rounded-[28px] border border-white/10 bg-surface/80 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
        <h1 className="text-[28px] font-medium leading-tight tracking-[-0.04em] text-white text-balance">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-white/50">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>
      {footer && <div className="mt-6 text-center text-sm text-white/50">{footer}</div>}
    </div>
  )
}

export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-white/30" role="separator">
      <span className="h-px flex-1 bg-white/8" />
      {label}
      <span className="h-px flex-1 bg-white/8" />
    </div>
  )
}

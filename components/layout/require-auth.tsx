'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/store/auth-context'
import { usePreferences } from '@/lib/store/preferences-context'
import { Logo } from '@/components/shared/logo'

interface RequireAuthProps {
  children: ReactNode
  /** Redirect to onboarding until the user has picked their streaming services. */
  requireOnboarding?: boolean
}

export function RequireAuth({ children, requireOnboarding = true }: RequireAuthProps) {
  const { status, user } = useAuth()
  const { preferences, ready } = usePreferences()
  const router = useRouter()
  const pathname = usePathname()

  const needsOnboarding = requireOnboarding && user?.fullyOnboarded === false

  useEffect(() => {
    if (status === 'unauthenticated') {
      const next = pathname && pathname !== '/' ? `?next=${encodeURIComponent(pathname)}` : ''
      router.replace(`/login${next}`)
    } else if (status === 'authenticated' && needsOnboarding) {
      router.replace('/onboarding')
    }
  }, [status, needsOnboarding, router, pathname])

  if (status !== 'authenticated' || !ready || needsOnboarding) {
    return <Splash />
  }

  return <>{children}</>
}

export function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <Logo size="lg" href="" className="animate-pulse" />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  )
}

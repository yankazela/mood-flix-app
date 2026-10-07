'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { Logo } from '@/components/shared/logo'

const TIMEOUT_MS = 20000

/**
 * Cognito redirects here after Google sign-in. Amplify exchanges the code,
 * the auth saga loads the user and registers them with the backend, and we
 * route on: new users land on onboarding via RequireAuth.
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackSplash />}>
      <AuthCallback />
    </Suspense>
  )
}

function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = useAppSelector((state) => state.auth.status)
  const error = useAppSelector((state) => state.auth.error)
  const providerError = searchParams.get('error_description') ?? searchParams.get('error')

  useEffect(() => {
    if (status === 'authenticated') router.replace('/')
  }, [status, router])

  useEffect(() => {
    const message = error ?? providerError
    if (message) router.replace(`/login?error=${encodeURIComponent(message)}`)
  }, [error, providerError, router])

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(`/login?error=${encodeURIComponent('Google sign-in took too long. Please try again.')}`)
    }, TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [router])

  return <CallbackSplash />
}

function CallbackSplash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-ink px-6 text-center">
      <Logo size="lg" href="" className="animate-pulse" />
      <p className="text-sm text-white/55" aria-live="polite">
        Signing you in with Google…
      </p>
    </div>
  )
}

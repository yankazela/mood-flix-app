'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/store/auth-context'

/** Send already-authenticated visitors away from the auth pages. */
export function useRedirectIfAuthenticated() {
  const { status } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  useEffect(() => {
    if (status === 'authenticated') {
      const next = searchParams.get('next')
      router.replace(next && next.startsWith('/') ? next : '/')
    }
  }, [status, router, searchParams])
  return status
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

'use client'

import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { sessionRequested, signOutRequested, type AuthStatus } from '@/store/auth/slice'
import { UserDetails } from '@/app/(auth)/signup/store/state'

export type { AuthStatus }

export interface AuthContextValue {
  user: UserDetails | null
  status: AuthStatus
  signOut: () => void
}

/**
 * Auth state lives in the Redux store (store/auth). This component restores
 * the session on start-up; `useAuth` is a thin selector so existing screens
 * keep a simple API.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(sessionRequested())
  }, [dispatch])
  return <>{children}</>
}

export function useAuth(): AuthContextValue {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const status = useAppSelector((state) => state.auth.status)
  const signOut = useCallback(() => {
    dispatch(signOutRequested())
  }, [dispatch])
  return useMemo(() => ({ user, status, signOut }), [user, status, signOut])
}

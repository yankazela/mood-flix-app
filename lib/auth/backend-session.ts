import type { User } from '@/lib/types'
import { readJSON, removeKey, writeJSON } from '@/lib/storage'
import type { AuthResponse, AuthTokens, UserDetails } from '@/app/(auth)/signup/store/state'

const AUTH_KEY = 'backendAuth'
const USER_KEY = 'backendUser'
const EXPIRES_AT_KEY = 'backendAuthExpiresAt'

export interface BackendSession {
  auth: AuthResponse
  user: UserDetails
  /** Epoch ms when the id and access tokens stop being accepted. The refresh token lasts far longer. */
  expiresAt: number
}

export function saveBackendSession(auth: AuthResponse, user: UserDetails, remember = true): void {
  const kind = remember ? 'local' : 'session'
  writeJSON(AUTH_KEY, auth, kind)
  writeJSON(USER_KEY, user, kind)
  writeJSON(EXPIRES_AT_KEY, Date.now() + auth.tokens.expiresIn * 1000, kind)
}

/**
 * The stored session, even when its access tokens have expired: the refresh token can still
 * renew them (see lib/auth/token-refresh). Null when nothing usable is stored.
 */
export function readBackendSession(): BackendSession | null {
  const session = readStoredSession('local') ?? readStoredSession('session')
  if (session) return session
  clearBackendSession()
  return null
}

function readStoredSession(kind: 'local' | 'session'): BackendSession | null {
  const auth = readJSON<AuthResponse | null>(AUTH_KEY, null, kind)
  const user = readJSON<UserDetails | null>(USER_KEY, null, kind)
  const expiresAt = readJSON<number | null>(EXPIRES_AT_KEY, null, kind)
  if (
    auth?.outcome === 'authenticated' &&
    auth.tokens?.idToken &&
    auth.tokens?.refreshToken &&
    user?.userId &&
    user.email &&
    typeof expiresAt === 'number'
  ) {
    return { auth, user, expiresAt }
  }
  return null
}

/** Stores renewed tokens next to the rest of the session, in whichever storage holds it. */
export function updateBackendTokens(tokens: AuthTokens): void {
  for (const kind of ['local', 'session'] as const) {
    const session = readStoredSession(kind)
    if (!session) continue
    writeJSON(AUTH_KEY, { ...session.auth, tokens }, kind)
    writeJSON(EXPIRES_AT_KEY, Date.now() + tokens.expiresIn * 1000, kind)
  }
}

export function clearBackendSession(): void {
  for (const kind of ['local', 'session'] as const) {
    removeKey(AUTH_KEY, kind)
    removeKey(USER_KEY, kind)
    removeKey(EXPIRES_AT_KEY, kind)
  }
}

export function updateBackendSessionUser(user: UserDetails): void {
  for (const kind of ['local', 'session'] as const) {
    const session = readStoredSession(kind)
    if (!session || session.user.userId !== user.userId) continue
    writeJSON(USER_KEY, user, kind)
    writeJSON(AUTH_KEY, { ...session.auth, user }, kind)
  }
}
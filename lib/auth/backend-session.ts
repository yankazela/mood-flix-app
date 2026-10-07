import type { User } from '@/lib/types'
import { readJSON, removeKey, writeJSON } from '@/lib/storage'
import type { AuthResponse, UserDetails } from '@/app/(auth)/signup/store/state'

const AUTH_KEY = 'backendAuth'
const USER_KEY = 'backendUser'
const EXPIRES_AT_KEY = 'backendAuthExpiresAt'

export function saveBackendSession(auth: AuthResponse, user: UserDetails, remember = true): void {
  const kind = remember ? 'local' : 'session'
  writeJSON(AUTH_KEY, auth, kind)
  writeJSON(USER_KEY, user, kind)
  writeJSON(EXPIRES_AT_KEY, Date.now() + auth.tokens.expiresIn * 1000, kind)
}

export function readBackendSession(): { auth: AuthResponse; user: UserDetails } | null {
  const session = readStoredSession('local') ?? readStoredSession('session')
  if (session) return session
  clearBackendSession()
  return null
}

function readStoredSession(kind: 'local' | 'session'): { auth: AuthResponse; user: UserDetails } | null {
  const auth = readJSON<AuthResponse | null>(AUTH_KEY, null, kind)
  const user = readJSON<UserDetails | null>(USER_KEY, null, kind)
  const expiresAt = readJSON<number | null>(EXPIRES_AT_KEY, null, kind)
  if (
    auth?.outcome === 'authenticated' &&
    auth.tokens?.idToken &&
    auth.tokens?.refreshToken &&
    user?.userId &&
    user.email &&
    typeof expiresAt === 'number' &&
    expiresAt > Date.now()
  ) {
    return { auth, user }
  }
  return null
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
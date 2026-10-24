import axios from 'axios'
import type { AuthTokens } from '@/app/(auth)/signup/store/state'
import { MOOD_API_URL } from '@/app/api/requests/types'
import { clearBackendSession, readBackendSession, updateBackendTokens } from '@/lib/auth/backend-session'

/** Renew the tokens this long before they expire, so a request never leaves with one about to lapse. */
const REFRESH_SKEW_MS = 60_000

type ExpiryListener = () => void
const listeners = new Set<ExpiryListener>()
let inflight: Promise<string> | null = null

/** Called when the session can no longer be renewed (refresh token expired or revoked). */
export function onSessionExpired(listener: ExpiryListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function notifySessionExpired(): void {
  clearBackendSession()
  listeners.forEach((listener) => listener())
}

/** An id token the API will accept, renewing it first when it is close to expiring. */
export async function getValidIdToken(): Promise<string> {
  const session = readBackendSession()
  if (!session) throw new Error('Unauthorized')
  if (session.expiresAt - Date.now() > REFRESH_SKEW_MS) return session.auth.tokens.idToken
  return refreshSession()
}

/** Exchanges the refresh token for new tokens. Concurrent callers share one request. */
export function refreshSession(): Promise<string> {
  if (!inflight) {
    inflight = renew().finally(() => {
      inflight = null
    })
  }
  return inflight
}

async function renew(): Promise<string> {
  const session = readBackendSession()
  if (!session) throw new Error('Unauthorized')
  try {
    const { data } = await axios.post<{ tokens: AuthTokens }>(
      `${MOOD_API_URL}/auth/refresh`,
      { refreshToken: session.auth.tokens.refreshToken },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15_000 },
    )
    updateBackendTokens({ ...session.auth.tokens, ...data.tokens })
    return data.tokens.idToken
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status
    // A rejected refresh token ends the session; a dropped connection should not.
    if (status === 400 || status === 401 || status === 403) {
      notifySessionExpired()
      throw new Error('Your session has expired. Please log in again.')
    }
    throw new Error('We couldn’t refresh your session. Check your connection and try again.')
  }
}

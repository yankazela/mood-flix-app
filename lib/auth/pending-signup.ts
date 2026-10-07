import { readJSON, removeKey, writeJSON } from '@/lib/storage'

/**
 * Sign-up details the backend needs but Cognito doesn't store (currently the
 * country). Kept in localStorage so it survives the Google redirect and the
 * "verified, now log in" path, which can finish in a different tab.
 */
export interface PendingSignup {
  /** Lower-cased email for password sign-ups; absent for Google, where it's unknown up front. */
  email?: string
  /** ISO 3166-1 alpha-2, upper-case. */
  country: string
  createdAt: number
}

const KEY = 'auth.pendingSignup'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function savePendingSignup(details: Omit<PendingSignup, 'createdAt'>): void {
  writeJSON<PendingSignup>(KEY, { ...details, email: details.email?.trim().toLowerCase(), createdAt: Date.now() })
}

/** Returns the pending details if they belong to this email (or were saved without one, e.g. Google). */
export function readPendingSignup(email?: string): PendingSignup | null {
  const pending = readJSON<PendingSignup | null>(KEY, null)
  if (!pending || Date.now() - pending.createdAt > MAX_AGE_MS) return null
  if (pending.email && email && pending.email !== email.trim().toLowerCase()) return null
  return pending
}

export function clearPendingSignup(): void {
  removeKey(KEY)
}

/**
 * Small, SSR-safe wrapper around Web Storage with JSON (de)serialisation.
 * Every call is guarded: private windows and blocked storage must never crash the app.
 */

export const STORAGE_PREFIX = 'moodflix.'

type StorageKind = 'local' | 'session'

function getStorage(kind: StorageKind): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function readJSON<T>(key: string, fallback: T, kind: StorageKind = 'local'): T {
  const storage = getStorage(kind)
  if (!storage) return fallback
  try {
    const raw = storage.getItem(STORAGE_PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T, kind: StorageKind = 'local'): void {
  const storage = getStorage(kind)
  if (!storage) return
  try {
    storage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {
    // Quota exceeded or storage disabled: silently ignore.
  }
}

export function removeKey(key: string, kind: StorageKind = 'local'): void {
  const storage = getStorage(kind)
  if (!storage) return
  try {
    storage.removeItem(STORAGE_PREFIX + key)
  } catch {
    // ignore
  }
}

/** Simple id generator good enough for mocked data. */
export function createId(prefix = 'id'): string {
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}${random}`
}

/** Simulated network latency so loading states are visible in the mock. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import type { AuthTokens } from '@/app/(auth)/signup/store/state'
import { readJSON, removeKey, writeJSON } from '@/lib/storage'

/**
 * Google sign-in inside the iOS and Android apps.
 *
 * Google refuses to sign people in inside an embedded WebView, and Amplify's redirect flow can
 * only navigate that WebView. So the apps open Cognito's Hosted UI in the system browser (a
 * Custom Tab on Android, SFSafariViewController on iOS), Cognito sends the browser back to the
 * app's own URL scheme, and this module exchanges the authorization code for tokens itself,
 * with PKCE and no client secret. The tokens then feed the same backend session as a password
 * sign-in, and the backend's /auth/refresh keeps them alive.
 */

/** Where Cognito sends the browser back to. Registered as a URL scheme in both native projects and as a callback URL on the app client. */
export const NATIVE_REDIRECT_URI = process.env.NEXT_PUBLIC_COGNITO_NATIVE_REDIRECT || 'upmymood://auth/callback'

const PENDING_KEY = 'auth.nativeOAuth'
/** A sign-in older than this is forgotten: the browser tab was abandoned. */
const PENDING_TTL_MS = 10 * 60_000
/** After the app is back in front, the callback may still be on its way for this long before the attempt counts as cancelled. */
const CANCEL_GRACE_MS = 1500

interface PendingSignIn {
  state: string
  verifier: string
  startedAt: number
}

export interface NativeOAuthConfig {
  /** Cognito Hosted UI domain, without scheme. */
  domain: string
  clientId: string
}

export const isNativeApp = (): boolean => Capacitor.isNativePlatform()

/** Opens the Hosted UI for Google in the system browser. The outcome arrives through listenForNativeCallback. */
export async function startNativeGoogleSignIn({ domain, clientId }: NativeOAuthConfig): Promise<void> {
  const state = randomToken(32)
  const verifier = randomToken(64)
  writeJSON<PendingSignIn>(PENDING_KEY, { state, verifier, startedAt: Date.now() })

  const query = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: 'openid email profile',
    redirect_uri: NATIVE_REDIRECT_URI,
    identity_provider: 'Google',
    state,
    code_challenge: await pkceChallenge(verifier),
    code_challenge_method: 'S256',
  })
  await Browser.open({ url: `https://${domain}/oauth2/authorize?${query}` })
}

export function isNativeCallbackUrl(url: string): boolean {
  return url.startsWith(NATIVE_REDIRECT_URI)
}

/** Turns the callback URL into tokens. Throws with a person-facing message when the sign-in did not go through. */
export async function completeNativeGoogleSignIn(url: string, { domain, clientId }: NativeOAuthConfig): Promise<AuthTokens> {
  const pending = readJSON<PendingSignIn | null>(PENDING_KEY, null)
  removeKey(PENDING_KEY)

  const params = callbackParams(url)
  const providerError = params.get('error_description') ?? params.get('error')
  if (providerError) throw new Error(providerError)

  const code = params.get('code')
  if (!pending || Date.now() - pending.startedAt > PENDING_TTL_MS) throw new Error('Google sign-in took too long. Please try again.')
  if (!code || params.get('state') !== pending.state) throw new Error('Google sign-in didn’t complete. Please try again.')

  const response = await fetch(`https://${domain}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code,
      redirect_uri: NATIVE_REDIRECT_URI,
      code_verifier: pending.verifier,
    }),
  })

  if (!response.ok) {
    const detail = await response
      .json()
      .then((body: { error?: string }) => body.error)
      .catch(() => undefined)
    throw new Error(detail ? `Google sign-in failed (${detail}). Please try again.` : 'Google sign-in failed. Please try again.')
  }

  const tokens = (await response.json()) as { id_token: string; access_token: string; refresh_token: string; expires_in: number; token_type?: string }
  return {
    idToken: tokens.id_token,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresIn: tokens.expires_in,
    tokenType: tokens.token_type || 'Bearer',
  }
}

export type NativeCallbackOutcome = { type: 'url'; url: string } | { type: 'cancelled' }

/**
 * Watches for the browser sending the person back. Reports the callback URL, or `cancelled` when
 * the browser closes or the app returns to the front with a sign-in pending and no callback follows.
 */
export function listenForNativeCallback(onOutcome: (outcome: NativeCallbackOutcome) => void): () => void {
  const handled = new Set<string>()
  let cancelTimer: ReturnType<typeof setTimeout> | undefined

  const settle = (outcome: NativeCallbackOutcome) => {
    if (cancelTimer) clearTimeout(cancelTimer)
    cancelTimer = undefined
    onOutcome(outcome)
  }

  const handleUrl = (url: string) => {
    if (!isNativeCallbackUrl(url) || handled.has(url)) return
    handled.add(url)
    // iOS keeps the Safari sheet up until it is dismissed; Android has nothing to close.
    Browser.close().catch(() => undefined)
    settle({ type: 'url', url })
  }

  const maybeCancelled = () => {
    if (!readJSON<PendingSignIn | null>(PENDING_KEY, null)) return
    if (cancelTimer) clearTimeout(cancelTimer)
    cancelTimer = setTimeout(() => {
      if (!readJSON<PendingSignIn | null>(PENDING_KEY, null)) return
      removeKey(PENDING_KEY)
      settle({ type: 'cancelled' })
    }, CANCEL_GRACE_MS)
  }

  const handles = [
    App.addListener('appUrlOpen', ({ url }) => handleUrl(url)),
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) maybeCancelled()
    }),
    Browser.addListener('browserFinished', maybeCancelled),
  ]

  // The callback may itself have started the app, e.g. after the system reclaimed it in the background.
  App.getLaunchUrl()
    .then((launch) => {
      if (launch?.url) handleUrl(launch.url)
    })
    .catch(() => undefined)

  return () => {
    if (cancelTimer) clearTimeout(cancelTimer)
    handles.forEach((handle) => handle.then((listener) => listener.remove()).catch(() => undefined))
  }
}

function randomToken(bytes: number): string {
  const buffer = new Uint8Array(bytes)
  crypto.getRandomValues(buffer)
  return base64Url(buffer)
}

async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64Url(new Uint8Array(digest))
}

function base64Url(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Query parameters of a callback URL. Custom schemes are split by hand because URL treats them as opaque. */
function callbackParams(url: string): URLSearchParams {
  const query = url.split('#')[0].split('?')[1] ?? ''
  return new URLSearchParams(query)
}

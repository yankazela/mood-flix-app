import { Amplify } from 'aws-amplify'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import { defaultStorage, sessionStorage } from 'aws-amplify/utils'
// Completes the Google (OAuth) redirect when the user lands back on the app.
import 'aws-amplify/auth/enable-oauth-listener'

/**
 * Cognito configuration. These values identify a public SPA app client and are
 * safe to ship to the browser; they are not secrets. Each one must be read with
 * a literal `process.env.NEXT_PUBLIC_*` expression so Next.js inlines it.
 */
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? ''
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ?? ''
const oauthDomain = (process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? '').replace(/^https?:\/\//, '').replace(/\/$/, '')
const redirectSignInEnv = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN ?? ''
const redirectSignOutEnv = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT ?? ''

export const isCognitoConfigured = Boolean(userPoolId && userPoolClientId)
export const isGoogleConfigured = isCognitoConfigured && Boolean(oauthDomain)
/** What the apps need to run the Hosted UI flow themselves; see lib/auth/native-oauth.ts. */
export const cognitoOAuth = { domain: oauthDomain, clientId: userPoolClientId }

const REMEMBER_KEY = 'moodflix.auth.remember'

function origin(): string {
  return typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin
}

function unique(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean))]
}

let configured = false

export function configureAmplify(): void {
  if (configured || !isCognitoConfigured) return
  configured = true

  Amplify.configure(
    {
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId,
          signUpVerificationMethod: 'code',
          loginWith: {
            email: true,
            ...(isGoogleConfigured && {
              oauth: {
                domain: oauthDomain,
                scopes: ['openid', 'email', 'profile'],
                // The configured URL plus this origin's, so a dev server or a preview still matches.
                redirectSignIn: unique([redirectSignInEnv, `${origin()}/auth/callback`]),
                redirectSignOut: unique([redirectSignOutEnv, `${origin()}/login`]),
                responseType: 'code' as const,
                providers: ['Google' as const],
              },
            }),
          },
        },
      },
    },
    { ssr: false },
  )

  cognitoUserPoolsTokenProvider.setKeyValueStorage(readRemember() ? defaultStorage : sessionStorage)
}

/** Choose where Cognito tokens live: localStorage ("remember me") or this tab only. */
export function setRememberSession(remember: boolean): void {
  try {
    window.localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0')
  } catch {
    // storage blocked: fall through with the in-memory choice
  }
  cognitoUserPoolsTokenProvider.setKeyValueStorage(remember ? defaultStorage : sessionStorage)
}

function readRemember(): boolean {
  try {
    return window.localStorage.getItem(REMEMBER_KEY) !== '0'
  } catch {
    return true
  }
}

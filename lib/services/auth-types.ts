import type { User } from '@/lib/types'

/**
 * Provider-agnostic auth contract. The UI and Redux sagas only depend on this;
 * `MockAuthProvider` and `CognitoAuthProvider` implement it.
 */

export interface SignInInput {
  email: string
  password: string
  /** Persist the session beyond the current tab. */
  remember?: boolean
}

export interface SignUpInput {
  name: string
  email: string
  password: string
}

export interface ConfirmSignUpInput {
  email: string
  code: string
}

export type SignUpResult =
  | { status: 'signed-in'; user: User }
  /** The provider emailed a verification code that must be confirmed first. */
  | { status: 'confirm-email'; email: string; destination?: string }

export type RedirectResult = { type: 'success' } | { type: 'failure'; message: string }

export type AuthErrorCode =
  | 'invalid-credentials'
  | 'email-in-use'
  | 'user-not-found'
  | 'user-not-confirmed'
  | 'weak-password'
  | 'code-mismatch'
  | 'code-expired'
  | 'too-many-attempts'
  | 'unsupported-step'
  | 'network'
  | 'unknown'

export class AuthError extends Error {
  code: AuthErrorCode

  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

export interface AuthProvider {
  /** Which backend is active. `mock` keeps the demo working without AWS. */
  readonly kind: 'mock' | 'cognito'
  /** Whether "Continue with Google" can be offered. */
  readonly googleEnabled: boolean
  getCurrentUser(): Promise<User | null>
  signIn(input: SignInInput): Promise<User>
  signUp(input: SignUpInput): Promise<SignUpResult>
  /** Resolves to the signed-in user, or `null` when verified but a manual log-in is still required. */
  confirmSignUp(input: ConfirmSignUpInput): Promise<User | null>
  resendSignUpCode(email: string): Promise<void>
  /** Resolves to the user, or `null` when the browser is being redirected to the identity provider. */
  signInWithGoogle(): Promise<User | null>
  signOut(): Promise<void>
  requestPasswordReset(email: string): Promise<void>
  /** JWT for calling our own backend, or `null` when not applicable. */
  getIdToken(): Promise<string | null>
  /** Subscribe to the outcome of an OAuth redirect (Google). Returns an unsubscribe function. */
  onRedirectResult(callback: (result: RedirectResult) => void): () => void
}

export function authErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}

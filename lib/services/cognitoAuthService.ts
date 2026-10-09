import {
  autoSignIn,
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  resendSignUpCode,
  resetPassword,
  signIn,
  signInWithRedirect,
  signOut,
  signUp,
} from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import type { AuthTokens } from '@/app/(auth)/signup/store/state'
import type { User } from '@/lib/types'
import { configureAmplify, isGoogleConfigured, setRememberSession } from '@/lib/auth/amplify-config'
import {
  AuthError,
  type AuthErrorCode,
  type AuthProvider,
  type ConfirmSignUpInput,
  type RedirectResult,
  type SignInInput,
  type SignUpInput,
  type SignUpResult,
} from '@/lib/services/auth-types'

/** Map Cognito exception names to friendly, typed errors. */
const COGNITO_ERRORS: Record<string, [AuthErrorCode, string]> = {
  NotAuthorizedException: ['invalid-credentials', 'That email and password combination doesn’t match our records.'],
  UserNotFoundException: ['user-not-found', 'We couldn’t find an account with that email.'],
  UsernameExistsException: ['email-in-use', 'An account with this email already exists. Try logging in instead.'],
  UserNotConfirmedException: ['user-not-confirmed', 'Your email isn’t verified yet.'],
  InvalidPasswordException: ['weak-password', 'Your password needs at least 8 characters, including a number, an uppercase letter and a symbol.'],
  CodeMismatchException: ['code-mismatch', 'That code isn’t right. Check the email and try again.'],
  ExpiredCodeException: ['code-expired', 'That code has expired. We can send you a new one.'],
  LimitExceededException: ['too-many-attempts', 'Too many attempts. Please wait a few minutes and try again.'],
  TooManyRequestsException: ['too-many-attempts', 'Too many attempts. Please wait a few minutes and try again.'],
  TooManyFailedAttemptsException: ['too-many-attempts', 'Too many attempts. Please wait a few minutes and try again.'],
  NetworkError: ['network', 'We couldn’t reach the sign-in service. Check your connection.'],
}

function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error
  const name = (error as { name?: string })?.name ?? ''
  const mapped = COGNITO_ERRORS[name]
  if (mapped) return new AuthError(mapped[0], mapped[1])
  const message = (error as { message?: string })?.message
  return new AuthError('unknown', message || 'Something went wrong. Please try again.')
}

function isFederatedGoogle(username: string, identities?: string): boolean {
  if (username.toLowerCase().startsWith('google_')) return true
  if (!identities) return false
  try {
    const parsed = JSON.parse(identities) as { providerName?: string }[]
    return parsed.some((identity) => identity.providerName?.toLowerCase() === 'google')
  } catch {
    return false
  }
}

const claim = (value: unknown) => (typeof value === 'string' ? value : undefined)

// Read the ID token instead of GetUser, which needs the aws.cognito.signin.user.admin scope Google sign-in doesn't request.
async function loadUser(): Promise<User> {
  const [{ userId, username }, session] = await Promise.all([getCurrentUser(), fetchAuthSession()])
  const claims = session.tokens?.idToken?.payload ?? {}
  const email = claim(claims.email) ?? username
  const name =
    claim(claims.name) ||
    [claim(claims.given_name), claim(claims.family_name)].filter(Boolean).join(' ') ||
    email.split('@')[0]
  return {
    id: claim(claims.sub) ?? userId,
    name,
    email,
    avatarUrl: claim(claims.picture),
    authProvider: isFederatedGoogle(username, claims.identities ? JSON.stringify(claims.identities) : undefined) ? 'google' : 'password',
    createdAt: new Date().toISOString(),
  }
}

export class CognitoAuthProvider implements AuthProvider {
  readonly kind = 'cognito' as const
  readonly googleEnabled = isGoogleConfigured

  constructor() {
    configureAmplify()
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await loadUser()
    } catch {
      return null
    }
  }

  async signIn({ email, password, remember = true }: SignInInput): Promise<User> {
    setRememberSession(remember)
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email.trim().toLowerCase(), password })
      if (isSignedIn) return loadUser()
      if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        throw new AuthError('user-not-confirmed', 'Your email isn’t verified yet.')
      }
      throw new AuthError('unsupported-step', `This account needs an extra sign-in step (${nextStep.signInStep}) that MoodFlix doesn’t support yet.`)
    } catch (error) {
      if ((error as { name?: string })?.name === 'UserAlreadyAuthenticatedException') return loadUser()
      throw toAuthError(error)
    }
  }

  async signUp({ name, email, password }: SignUpInput): Promise<SignUpResult> {
    const username = email.trim().toLowerCase()
    setRememberSession(true)
    try {
      const { nextStep } = await signUp({
        username,
        password,
        options: { userAttributes: { email: username, name: name.trim() }, autoSignIn: true },
      })
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        return { status: 'confirm-email', email: username, destination: nextStep.codeDeliveryDetails?.destination }
      }
      if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
        await autoSignIn()
        return { status: 'signed-in', user: await loadUser() }
      }
      return { status: 'signed-in', user: await this.signIn({ email: username, password }) }
    } catch (error) {
      throw toAuthError(error)
    }
  }

  async confirmSignUp({ email, code }: ConfirmSignUpInput): Promise<User | null> {
    let nextStep: Awaited<ReturnType<typeof confirmSignUp>>['nextStep']
    try {
      ;({ nextStep } = await confirmSignUp({ username: email.trim().toLowerCase(), confirmationCode: code.trim() }))
    } catch (error) {
      throw toAuthError(error)
    }
    // Auto sign-in only works in the same tab that started the sign-up.
    if (nextStep.signUpStep !== 'COMPLETE_AUTO_SIGN_IN') return null
    try {
      const { isSignedIn } = await autoSignIn()
      return isSignedIn ? await loadUser() : null
    } catch {
      return null
    }
  }

  async resendSignUpCode(email: string): Promise<void> {
    try {
      await resendSignUpCode({ username: email.trim().toLowerCase() })
    } catch (error) {
      throw toAuthError(error)
    }
  }

  async signInWithGoogle(): Promise<User | null> {
    if (!this.googleEnabled) {
      throw new AuthError('unknown', 'Google sign-in isn’t configured for this environment.')
    }
    setRememberSession(true)
    try {
      await signInWithRedirect({ provider: 'Google' })
      return null
    } catch (error) {
      if ((error as { name?: string })?.name === 'UserAlreadyAuthenticatedException') return loadUser()
      throw toAuthError(error)
    }
  }

  async signOut(): Promise<void> {
    await signOut()
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await resetPassword({ username: email.trim().toLowerCase() })
    } catch (error) {
      throw toAuthError(error)
    }
  }

  async getIdToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession()
      return session.tokens?.idToken?.toString() ?? null
    } catch {
      return null
    }
  }

  async getSessionTokens(): Promise<AuthTokens | null> {
    const session = await fetchAuthSession()
    const stored = await cognitoUserPoolsTokenProvider.authTokenStore.loadTokens()
    const idToken = session.tokens?.idToken
    const accessToken = session.tokens?.accessToken
    const refreshToken = stored?.refreshToken
    if (!idToken || !accessToken || !refreshToken) return null
    const expiresAt = Math.min(Number(idToken.payload.exp), Number(accessToken.payload.exp))
    const expiresIn = Math.floor(expiresAt - Date.now() / 1000)
    if (!Number.isFinite(expiresIn) || expiresIn <= 0) return null
    return {
      idToken: idToken.toString(),
      accessToken: accessToken.toString(),
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    }
  }

  onRedirectResult(callback: (result: RedirectResult) => void): () => void {
    return Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signInWithRedirect') callback({ type: 'success' })
      if (payload.event === 'signInWithRedirect_failure') {
        const message = (payload.data as { error?: { message?: string } } | undefined)?.error?.message
        callback({ type: 'failure', message: message || 'Google sign-in didn’t complete. Please try again.' })
      }
    })
  }
}

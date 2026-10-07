import type { User } from '@/lib/types'
import { createId, delay, readJSON, removeKey, writeJSON } from '@/lib/storage'
import { isCognitoConfigured } from '@/lib/auth/amplify-config'
import { CognitoAuthProvider } from '@/lib/services/cognitoAuthService'
import {
  AuthError,
  type AuthProvider,
  type ConfirmSignUpInput,
  type RedirectResult,
  type SignInInput,
  type SignUpInput,
  type SignUpResult,
} from '@/lib/services/auth-types'

export * from '@/lib/services/auth-types'

/**
 * Authentication service.
 *
 * The UI and Redux sagas only talk to the `AuthProvider` interface.
 * - With Cognito env vars set (see .env.example) the real `CognitoAuthProvider` is used.
 * - Without them, `MockAuthProvider` keeps users in Web Storage so the demo still works.
 */

// ---------------------------------------------------------------------------
// Mock implementation
// ---------------------------------------------------------------------------

interface StoredUser extends User {
  /** Plain text for the mock only. Never do this with a real provider. */
  password: string
}

const USERS_KEY = 'auth.users'
const SESSION_KEY = 'auth.session'
const MOCK_LATENCY_MS = 650

/** A ready-made account so the demo can be explored without signing up. */
export const DEMO_CREDENTIALS = {
  email: 'demo@moodflix.app',
  password: 'moodflix',
} as const

const DEMO_USER: StoredUser = {
  id: 'user_demo',
  name: 'Jamie Rivera',
  email: DEMO_CREDENTIALS.email,
  password: DEMO_CREDENTIALS.password,
  authProvider: 'password',
  createdAt: '2026-09-01T10:00:00.000Z',
}

function stripPassword(user: StoredUser): User {
  const { password: _password, ...safe } = user
  return safe
}

class MockAuthProvider implements AuthProvider {
  readonly kind = 'mock' as const
  readonly googleEnabled = true

  private readUsers(): StoredUser[] {
    const users = readJSON<StoredUser[]>(USERS_KEY, [])
    if (!users.some((user) => user.email === DEMO_USER.email)) {
      const seeded = [DEMO_USER, ...users]
      writeJSON(USERS_KEY, seeded)
      return seeded
    }
    return users
  }

  private writeUsers(users: StoredUser[]) {
    writeJSON(USERS_KEY, users)
  }

  private readSession(): User | null {
    return readJSON<User | null>(SESSION_KEY, null, 'local') ?? readJSON<User | null>(SESSION_KEY, null, 'session')
  }

  private writeSession(user: User, remember: boolean) {
    removeKey(SESSION_KEY, 'local')
    removeKey(SESSION_KEY, 'session')
    writeJSON(SESSION_KEY, user, remember ? 'local' : 'session')
  }

  async getCurrentUser(): Promise<User | null> {
    return this.readSession()
  }

  async signIn({ email, password, remember = true }: SignInInput): Promise<User> {
    await delay(MOCK_LATENCY_MS)
    const normalized = email.trim().toLowerCase()
    const user = this.readUsers().find((candidate) => candidate.email.toLowerCase() === normalized)
    if (!user || user.password !== password) {
      throw new AuthError('invalid-credentials', 'That email and password combination doesn’t match our records.')
    }
    const safe = stripPassword(user)
    this.writeSession(safe, remember)
    return safe
  }

  async signUp({ name, email, password }: SignUpInput): Promise<SignUpResult> {
    await delay(MOCK_LATENCY_MS)
    const normalized = email.trim().toLowerCase()
    const users = this.readUsers()
    if (users.some((candidate) => candidate.email.toLowerCase() === normalized)) {
      throw new AuthError('email-in-use', 'An account with this email already exists. Try logging in instead.')
    }
    if (password.length < 8) {
      throw new AuthError('weak-password', 'Your password needs at least 8 characters.')
    }
    const user: StoredUser = {
      id: createId('user'),
      name: name.trim(),
      email: normalized,
      password,
      authProvider: 'password',
      createdAt: new Date().toISOString(),
    }
    this.writeUsers([...users, user])
    const safe = stripPassword(user)
    this.writeSession(safe, true)
    // The mock skips email verification and signs the user straight in.
    return { status: 'signed-in', user: safe }
  }

  async confirmSignUp(_input: ConfirmSignUpInput): Promise<User | null> {
    await delay(MOCK_LATENCY_MS)
    return this.getCurrentUser()
  }

  async resendSignUpCode(_email: string): Promise<void> {
    await delay(MOCK_LATENCY_MS)
  }

  async signInWithGoogle(): Promise<User | null> {
    await delay(MOCK_LATENCY_MS + 300)
    const email = 'alex.chen@gmail.com'
    const users = this.readUsers()
    let user = users.find((candidate) => candidate.email === email)
    if (!user) {
      user = {
        id: createId('user'),
        name: 'Alex Chen',
        email,
        password: '',
        authProvider: 'google',
        createdAt: new Date().toISOString(),
      }
      this.writeUsers([...users, user])
    }
    const safe = stripPassword(user)
    this.writeSession(safe, true)
    return safe
  }

  async signOut(): Promise<void> {
    await delay(200)
    removeKey(SESSION_KEY, 'local')
    removeKey(SESSION_KEY, 'session')
  }

  async requestPasswordReset(email: string): Promise<void> {
    await delay(MOCK_LATENCY_MS)
    const exists = this.readUsers().some((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase())
    if (!exists) {
      throw new AuthError('user-not-found', 'We couldn’t find an account with that email.')
    }
  }

  async getIdToken(): Promise<string | null> {
    return null
  }

  onRedirectResult(_callback: (result: RedirectResult) => void): () => void {
    return () => undefined
  }
}

export const authService: AuthProvider = isCognitoConfigured ? new CognitoAuthProvider() : new MockAuthProvider()

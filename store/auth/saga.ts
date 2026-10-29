import type { PayloadAction } from '@reduxjs/toolkit'
import { eventChannel, type EventChannel, type SagaIterator } from 'redux-saga'
import type { AxiosResponse } from 'axios'
import type { AuthResponse, AuthTokens } from '@/app/(auth)/signup/store/state'
import type { User } from '@/lib/types'
import { all, call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import type { UpdateUserRequest, UserDetails } from '@/app/(auth)/signup/store/state'
import { endpoints } from '@/app/api/endpoints'
import { getRequest, patchRequest, ApiError } from '@/app/api/requests'
import { MOOD_API_URL } from '@/app/api/requests/types'
import { updateBackendSessionUser } from '@/lib/auth/backend-session'
import type { RootState } from '@/store/rootStore'
import { clearBackendSession, readBackendSession, saveBackendSession } from '@/lib/auth/backend-session'
import { authenticateWithBackend } from '@/lib/services/backendAuthService'
import { AuthError, authErrorMessage, authService, type RedirectResult, type SignInInput } from '@/lib/services/authService'
import { registerUserWithBackend } from '@/store/auth/registration'
import {
  googleSignInRequested,
  sessionRequested,
  sessionResolved,
  signInFailed,
  signInNeedsConfirmation,
  signInCancelled,
  signInRequested,
  signInSucceeded,
  signOutRequested,
  signedOut,
  updateUserRequested,
  updateUserSucceeded,
  updateUserFailed,
  profileSynced,
} from '@/store/auth/slice'

/** The signed-in user's profile. Pass fresh `tokens` when the session is not stored yet; otherwise the stored, auto-refreshed session is used. */
async function fetchBackendUser(tokens?: AuthTokens): Promise<UserDetails> {
  const path = endpoints.me()
  const response = await getRequest<{ user: UserDetails }>(
    {
      path: path.endpoint,
      auth: !tokens,
      headers: tokens ? { ...path.headers, Authorization: `Bearer ${tokens.idToken}` } : path.headers,
    },
    MOOD_API_URL,
  )
  const user = response.data.user;
  if (!user?.userId || !user.email) throw new Error('Unable to load your account profile.')
  return user
}

function* completeGoogleSession(identity: User): SagaIterator<UserDetails> {
  if (!authService.getSessionTokens) throw new Error('Google token storage is not available for this auth provider.')
  const tokens: AuthTokens | null = yield call([authService, authService.getSessionTokens])
  if (!tokens) throw new Error('Google sign-in did not return a valid token session. Please try again.')
  // yield call(registerUserWithBackend, identity)
  const user: UserDetails = yield call(fetchBackendUser, tokens)
  yield call(saveBackendSession, { outcome: 'authenticated', tokens, user }, user)
  yield put(profileSynced(user))
  return user
}

/** The apps exchange the Google code themselves; the tokens become the same session a password sign-in creates. */
function* completeTokenSession(tokens: AuthTokens): SagaIterator<UserDetails> {
  const user: UserDetails = yield call(fetchBackendUser, tokens)
  yield call(saveBackendSession, { outcome: 'authenticated', tokens, user }, user)
  yield put(profileSynced(user))
  return user
}

const sendUpdateUserRequest = async (data: UpdateUserRequest) => {
  const path = endpoints.updateUser()
  const response: AxiosResponse<{ user: UserDetails }> = await patchRequest(
    {
      path: path.endpoint,
      auth: path.auth,
      headers: path.headers,
      data,
    },
    MOOD_API_URL,
  )
  return response.data
}

function* handleUpdateUser(action: PayloadAction<UpdateUserRequest>): SagaIterator {
  try {
    const user: UserDetails | null = yield select((state: RootState) => state.auth.user)
    
    if (!user) {
      throw new Error('Please log in to save your preferences.')
    }

    const response: { user: UserDetails } = yield call(sendUpdateUserRequest, action.payload)
    const currentUser: UserDetails | null = yield select((state: RootState) => state.auth.user)

    if (currentUser?.userId !== user.userId) return

    const updated = { ...currentUser, ...response.user }

    yield call(updateBackendSessionUser, updated)
    yield put(updateUserSucceeded(updated))
  } catch (error) {
    yield put(updateUserFailed(authErrorMessage(error)))
  }
}

function* restoreSession(): SagaIterator {
  let storedUser: UserDetails | null = null
  try {
    const backendSession: ReturnType<typeof readBackendSession> = yield call(readBackendSession)
    if (backendSession) {
      storedUser = backendSession.user
      // Renews the tokens first when they have expired, so a returning visitor stays signed in.
      const user: UserDetails = yield call(fetchBackendUser)
      yield call(updateBackendSessionUser, user)
      yield put(profileSynced(user))
      yield put(sessionResolved(user))
      return
    }
    const identity: User | null = yield call([authService, authService.getCurrentUser])
    if (identity && authService.kind === 'cognito') {
      const user: UserDetails = yield call(completeGoogleSession, identity)
      yield put(sessionResolved(user))
    } else {
      yield put(sessionResolved(null))
    }
  } catch (error) {
    // Offline or the API is down: the stored session is still good, so keep the person signed in.
    const unreachable = error instanceof ApiError && (error.status === undefined || error.status >= 500)
    if (storedUser && unreachable) {
      yield put(sessionResolved(storedUser))
      return
    }
    console.warn('[auth] Session restore failed:', error)
    yield put(signInFailed(authErrorMessage(error)))
    yield put(sessionResolved(null))
  }
}

function* handleSignIn(action: PayloadAction<SignInInput>): SagaIterator {
  try {
    const auth: AuthResponse = yield call(authenticateWithBackend, action.payload)
    if (auth.outcome !== 'authenticated') throw new Error('Unable to sign in. Please try again.')

  
    yield call(saveBackendSession, auth, auth.user, action.payload.remember ?? true)
    yield put(signInSucceeded(auth.user))
  } catch (error) {
    if (error instanceof AuthError && error.code === 'user-not-confirmed') {
      yield put(signInNeedsConfirmation(action.payload.email.trim().toLowerCase()))
    } else {
      yield put(signInFailed(authErrorMessage(error)))
    }
  }
}

function decodeIdToken(token: string): Record<string, string> {
  try {
    const payload = token.split('.')[1]
    if (!payload) return {}
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(normalized)) as Record<string, unknown>
    return Object.fromEntries(
      Object.entries(decoded).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    )
  } catch {
    return {}
  }
}

/** Starts Google sign-in (and sign-up: Cognito creates the user on first Google login). */
function* handleGoogleSignIn(): SagaIterator {
  try {
    const identity: User | null = yield call([authService, authService.signInWithGoogle])
    // `null` means the browser is redirecting to Google; the result arrives via watchRedirects.
    if (identity) {
      const user: UserDetails = yield call(completeGoogleSession, identity)
      yield put(signInSucceeded(user))
    }
  } catch (error) {
    yield put(signInFailed(authErrorMessage(error)))
  }
}

function* handleSignOut(): SagaIterator {
  try {
    yield call([authService, authService.signOut])
  } catch (error) {
    console.warn('[auth] Sign-out failed, clearing local session anyway:', error)
  } finally {
    yield call(clearBackendSession)
    yield put(signedOut())
  }
}

function redirectChannel(): EventChannel<RedirectResult> {
  return eventChannel<RedirectResult>((emit) => authService.onRedirectResult(emit))
}

/** Finishes the Google flow when Cognito sends the user back to /auth/callback. */
function* watchRedirects(): SagaIterator {
  const channel: EventChannel<RedirectResult> = yield call(redirectChannel)
  try {
    while (true) {
      const result: RedirectResult = yield take(channel)
      if (result.type === 'failure') {
        yield put(signInFailed(result.message))
        continue
      }
      if (result.type === 'cancelled') {
        yield put(signInCancelled())
        continue
      }
      try {
        if (result.tokens) {
          const user: UserDetails = yield call(completeTokenSession, result.tokens)
          yield put(signInSucceeded(user))
          continue
        }
        const identity: User | null = yield call([authService, authService.getCurrentUser])
        if (!identity) throw new Error('Google sign-in did not complete. Please try again.')
        const user: UserDetails = yield call(completeGoogleSession, identity)
        yield put(signInSucceeded(user))
      } catch (error) {
        yield put(signInFailed(authErrorMessage(error)))
      }
    }
  } finally {
    channel.close()
  }
}

export default function* authSaga(): SagaIterator {
  yield all([
    takeLatest(updateUserRequested.type, handleUpdateUser),
    takeLatest(sessionRequested.type, restoreSession),
    takeLatest(signInRequested.type, handleSignIn),
    takeLatest(googleSignInRequested.type, handleGoogleSignIn),
    takeLatest(signOutRequested.type, handleSignOut),
    fork(watchRedirects),
  ])
}

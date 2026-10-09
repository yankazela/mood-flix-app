import type { PayloadAction } from '@reduxjs/toolkit'
import { eventChannel, type EventChannel, type SagaIterator } from 'redux-saga'
import type { AxiosResponse } from 'axios'
import type { AuthResponse, AuthTokens } from '@/app/(auth)/signup/store/state'
import type { User } from '@/lib/types'
import { all, call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import type { UpdateUserRequest, UserDetails } from '@/app/(auth)/signup/store/state'
import { endpoints } from '@/app/api/endpoints'
import { getRequest, patchRequest } from '@/app/api/requests'
import { EbaseUrls } from '@/app/api/requests/types'
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
  signInRequested,
  signInSucceeded,
  signOutRequested,
  signedOut,
  updateUserRequested,
  updateUserSucceeded,
  updateUserFailed,
  profileSynced,
} from '@/store/auth/slice'

async function fetchBackendUser(tokens: AuthTokens): Promise<UserDetails> {
  const path = endpoints.me()
  const response = await getRequest<{ user: UserDetails }>(
    {
      path: path.endpoint,
      auth: false,
      headers: { ...path.headers, Authorization: `Bearer ${tokens.idToken}` },
    },
    EbaseUrls.MOOD_BE,
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

const sendUpdateUserRequest = async (data: UpdateUserRequest) => {
  const path = endpoints.updateUser()
  const response: AxiosResponse<{ user: UserDetails }> = await patchRequest(
    {
      path: path.endpoint,
      auth: path.auth,
      headers: path.headers,
      data,
    },
    EbaseUrls.MOOD_BE,
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
    console.log('Current user before update:', currentUser)
    console.log('Response from update request:', response)

    if (currentUser?.userId !== user.userId) return

    const updated = { ...currentUser, ...response.user }

    yield call(updateBackendSessionUser, updated)
    yield put(updateUserSucceeded(updated))
  } catch (error) {
    yield put(updateUserFailed(authErrorMessage(error)))
  }
}

function* restoreSession(): SagaIterator {
  try {
    const backendSession: ReturnType<typeof readBackendSession> = yield call(readBackendSession)
    if (backendSession) {
      const user: UserDetails = yield call(fetchBackendUser, backendSession.auth.tokens)
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
      try {
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

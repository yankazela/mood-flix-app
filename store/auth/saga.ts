import type { PayloadAction } from '@reduxjs/toolkit'
import { eventChannel, type EventChannel, type SagaIterator } from 'redux-saga'
import type { AxiosResponse } from 'axios'
import type { AuthResponse } from '@/app/(auth)/signup/store/state'
import { all, call, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import type { UpdateUserRequest, UserDetails } from '@/app/(auth)/signup/store/state'
import { endpoints } from '@/app/api/endpoints'
import { patchRequest } from '@/app/api/requests'
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
} from '@/store/auth/slice'

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
    const user: UserDetails | null = backendSession?.user ?? (yield call([authService, authService.getCurrentUser]))
    yield put(sessionResolved(user))
  } catch {
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
    const user: UserDetails | null = yield call([authService, authService.signInWithGoogle])
    // `null` means the browser is redirecting to Google; the result arrives via watchRedirects.
    if (user) {
      yield put(signInSucceeded(user))
      yield call(registerUserWithBackend, user)
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
      const user: UserDetails | null = yield call([authService, authService.getCurrentUser])
      if (!user) {
        yield put(signInFailed('Google sign-in didn’t complete. Please try again.'))
        continue
      }
      yield put(signInSucceeded(user))
      yield call(registerUserWithBackend, user)
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

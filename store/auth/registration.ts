import type { AxiosResponse } from 'axios'
import { call, put } from 'redux-saga/effects'
import type { SagaIterator } from 'redux-saga'
import type { User } from '@/lib/types'
import { authService, authErrorMessage } from '@/lib/services/authService'
import { clearPendingSignup, readPendingSignup, type PendingSignup } from '@/lib/auth/pending-signup'
import { endpoints } from '@/app/api/endpoints'
import { postRequest } from '@/app/api/requests'
import { EbaseUrls } from '@/app/api/requests/types'
import type { CreateUserRequest, UserDetails } from '@/app/(auth)/signup/store/state'
import { profileSyncFailed, profileSynced } from '@/store/auth/slice'

/**
 * Create the MoodFlix user record (POST /user) for a Cognito identity.
 *
 * Cognito is the source of truth for identity, so a backend failure is logged
 * and stored but never blocks the person from using the app. The endpoint is
 * called after every Google sign-in, so it should behave as an upsert.
 */
export function* registerUserWithBackend(user: User): SagaIterator<UserDetails | null> {
  if (authService.kind !== 'cognito') return null

  try {
    const idToken: string | null = yield call([authService, authService.getIdToken])
    // Country picked on the sign-up page before the Google redirect.
    const pending: PendingSignup | null = yield call(readPendingSignup, user.email)
    const path = endpoints.createUser()
    const body: CreateUserRequest = {
      userId: user.id,
      email: user.email,
      fullName: user.name,
      provider: user.authProvider === 'google' ? 'google' : 'cognito',
      ...(pending?.country && { country: pending.country }),
    }
    const response: AxiosResponse<UserDetails> = yield call(
      postRequest<UserDetails>,
      {
        path: path.endpoint,
        auth: false,
        headers: { ...path.headers, ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
        data: body,
      },
      EbaseUrls.MOOD_BE,
    )
    yield call(clearPendingSignup)
    yield put(profileSynced(response.data))
    return response.data
  } catch (error) {
    const message = authErrorMessage(error)
    console.warn('[auth] Backend user registration failed:', message)
    yield put(profileSyncFailed(message))
    return null
  }
}

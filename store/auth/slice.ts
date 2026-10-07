import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UpdateUserRequest, UserDetails } from '@/app/(auth)/signup/store/state'
import type { SignInInput } from '@/lib/services/auth-types'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
export type AuthPending = 'password' | 'google' | 'sign-out' | null

export interface AuthState {
  status: AuthStatus
  user: UserDetails | null
  pending: AuthPending
  error: string | null
  /** Set when a password log-in hits an account whose email isn't verified yet. */
  unconfirmedEmail: string | null
  /** The MoodFlix backend record created after Cognito sign-up. */
  profile: UserDetails | null
  profileError: string | null
  updateStatus: 'idle' | 'pending' | 'succeeded' | 'failed'
  updateError: string | null
}

const initialState: AuthState = {
  status: 'loading',
  user: null,
  pending: null,
  error: null,
  unconfirmedEmail: null,
  profile: null,
  profileError: null,
  updateStatus: 'idle',
  updateError: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateUserRequested: (state, _action: PayloadAction<UpdateUserRequest>) => {
      state.updateStatus = 'pending'
      state.updateError = null
    },
    updateUserSucceeded: (state, action: PayloadAction<UserDetails>) => {
      state.user = action.payload
      state.profile = action.payload
      state.updateStatus = 'succeeded'
      state.updateError = null
    },
    updateUserFailed: (state, action: PayloadAction<string>) => {
      state.updateStatus = 'failed'
      state.updateError = action.payload
    },
    updateUserReset: (state) => {
      state.updateStatus = 'idle'
      state.updateError = null
    },
    /** Restore an existing session on app start. */
    sessionRequested: () => undefined,
    sessionResolved: (state, action: PayloadAction<UserDetails | null>) => {
      // A Google redirect can finish before the start-up check does; never undo it.
      if (!action.payload && state.status === 'authenticated') return
      state.user = action.payload
      state.status = action.payload ? 'authenticated' : 'unauthenticated'
    },
    signInRequested: (state, _action: PayloadAction<SignInInput>) => {
      state.pending = 'password'
      state.error = null
      state.unconfirmedEmail = null
    },
    googleSignInRequested: (state) => {
      state.pending = 'google'
      state.error = null
    },
    signInSucceeded: (state, action: PayloadAction<UserDetails>) => {
      state.user = action.payload
      state.status = 'authenticated'
      state.pending = null
      state.error = null
      state.unconfirmedEmail = null
    },
    signInFailed: (state, action: PayloadAction<string>) => {
      state.pending = null
      state.error = action.payload
    },
    signInNeedsConfirmation: (state, action: PayloadAction<string>) => {
      state.pending = null
      state.unconfirmedEmail = action.payload
    },
    signOutRequested: (state) => {
      state.pending = 'sign-out'
    },
    signedOut: (state) => {
      state.user = null
      state.status = 'unauthenticated'
      state.pending = null
      state.profile = null
      state.profileError = null
      state.updateStatus = 'idle'
      state.updateError = null
    },
    authErrorCleared: (state) => {
      state.error = null
      state.unconfirmedEmail = null
    },
    profileSynced: (state, action: PayloadAction<UserDetails>) => {
      state.profile = action.payload
      state.profileError = null
    },
    profileSyncFailed: (state, action: PayloadAction<string>) => {
      state.profileError = action.payload
    },
  },
})

export const {
  updateUserRequested,
  updateUserSucceeded,
  updateUserFailed,
  updateUserReset,
  sessionRequested,
  sessionResolved,
  signInRequested,
  googleSignInRequested,
  signInSucceeded,
  signInFailed,
  signInNeedsConfirmation,
  signOutRequested,
  signedOut,
  authErrorCleared,
  profileSynced,
  profileSyncFailed,
} = authSlice.actions

export default authSlice.reducer

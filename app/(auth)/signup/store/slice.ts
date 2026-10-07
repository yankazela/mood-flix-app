import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ConfirmUserPayload, NeedsConfirmationPayload, SignupState, User, UserDetails } from './state';

const initialState: SignupState = {
    form: {
        email: '',
        password: '',
        fullName: '',
        country: '',
    },
    step: 'details',
    codeDestination: undefined,
    error: undefined,
    isSubmitting: false,
    isResending: false,
    codeSentAt: undefined,
    isSuccess: false,
    details: undefined,
};

const signupSlice = createSlice({
    name: 'signup',
    initialState,
    reducers: {
        /** Create the Cognito user. The password only travels in this action, never into state. */
        submitUser: (state, action: PayloadAction<User>) => {
            console.log('Submitting user with payload:', action.payload);
            state.form = {
                email: action.payload.email.trim().toLowerCase(),
                password: '',
                fullName: action.payload.fullName,
                country: action.payload.country,
            };
            state.isSubmitting = true;
            state.error = undefined;
        },
        submitUserNeedsConfirmation: (state, action: PayloadAction<NeedsConfirmationPayload>) => {
            state.isSubmitting = false;
            state.step = 'confirm';
            state.form.email = action.payload.email;
            state.codeDestination = action.payload.destination;
            state.codeSentAt = action.payload.sentAt;
        },
        /** Jump straight to the code step, e.g. from login for an unverified account. */
        startConfirmation: (state, action: PayloadAction<string>) => {
            state.step = 'confirm';
            state.form.email = action.payload;
            state.error = undefined;
        },
        confirmUser: (state, _action: PayloadAction<ConfirmUserPayload>) => {
            state.isSubmitting = true;
            state.error = undefined;
        },
        confirmUserVerified: (state) => {
            state.isSubmitting = false;
            state.step = 'verified';
        },
        resendCode: (state, _action: PayloadAction<string>) => {
            state.isResending = true;
            state.error = undefined;
        },
        resendCodeSuccess: (state, action: PayloadAction<number>) => {
            state.isResending = false;
            state.codeSentAt = action.payload;
        },
        resendCodeError: (state, action: PayloadAction<string>) => {
            state.isResending = false;
            state.error = action.payload;
        },
        submitUserError: (state, action: PayloadAction<string>) => {
            state.isSubmitting = false;
            state.error = action.payload;
        },
        submitUserSuccess: (state, action: PayloadAction<UserDetails | null>) => {
            state.isSubmitting = false;
            state.isSuccess = true;
            state.step = 'done';
            state.details = action.payload ?? undefined;
        },
        resetSignup: () => initialState,
    },
});

export const {
    submitUser,
    submitUserNeedsConfirmation,
    startConfirmation,
    confirmUser,
    confirmUserVerified,
    resendCode,
    resendCodeSuccess,
    resendCodeError,
    submitUserError,
    submitUserSuccess,
    resetSignup,
} = signupSlice.actions;
export default signupSlice.reducer;

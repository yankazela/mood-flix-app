import { PayloadAction } from '@reduxjs/toolkit';
import { takeLatest, put, call } from "redux-saga/effects";
import { AxiosResponse } from "axios";

import { endpoints } from "../../../api/endpoints";
import { postRequest } from "../../../api/requests";
import { EbaseUrls } from "../../../api/requests/types";
import { saveBackendSession } from "@/lib/auth/backend-session";
import { authenticateWithBackend } from '@/lib/services/backendAuthService';
import type { User as AppUser } from '@/lib/types';
import { profileSynced, signInSucceeded } from '@/store/auth/slice';

import { submitUser, submitUserSuccess, submitUserError } from "./slice";
import { AuthResponse, User, UserDetails } from './state';

const sendUserRequest = async (user: User) => {
    try {
        const path = endpoints.createUser();
        const response: AxiosResponse<UserDetails> = await postRequest(
            {
                path: path.endpoint,
                auth: path.auth,
                headers: path.headers,
                data: user
            }, EbaseUrls.MOOD_BE
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

function* handleSubmitUser(action: PayloadAction<User>) {
    try {
        const userDetails: UserDetails = yield call(sendUserRequest, action.payload);
        const authResponse: AuthResponse = yield call(authenticateWithBackend, {
            email: action.payload.email,
            password: action.payload.password ?? '',
        });
        if (authResponse.outcome !== 'authenticated') {
            throw new Error('Account was created, but sign-in failed. Please log in.');
        }

        yield call(saveBackendSession, authResponse, userDetails);
        yield put(signInSucceeded(userDetails));
        yield put(profileSynced(userDetails));
        yield put(submitUserSuccess(userDetails));
    } catch (error: any) {
        yield put(submitUserError(error.message || "An unknown error occurred"));
    }
}

function* signUpSaga() {
    yield takeLatest(submitUser.type, handleSubmitUser);
}

export default signUpSaga;
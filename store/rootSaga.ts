import { all } from 'redux-saga/effects';
import authSaga from './auth/saga';
import signUpSaga from '../app/(auth)/signup/store/saga';

export default function* rootSaga() {
    yield all([
        authSaga(),
        signUpSaga(),
    ]);
}

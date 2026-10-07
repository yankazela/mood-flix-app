import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import authReducer from './auth/slice';
import signupReducer from '../app/(auth)/signup/store/slice';
import rootSaga from './rootSaga';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    auth: authReducer,
    signup: signupReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

/**
 * Snapshot taken before any action runs. Passed to <Provider serverState> so
 * hydration renders exactly what the server did, even if the session has
 * already been restored on the client by the time a boundary hydrates.
 */
export const initialRootState = store.getState();

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

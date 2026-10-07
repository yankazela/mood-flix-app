'use client'

import { Provider } from 'react-redux'
import store, { initialRootState } from '@/store/rootStore'

export function ReduxProvider({ children }: {children: React.ReactNode}) {
    return (
        <Provider store={store} serverState={initialRootState}>
            {children}
        </Provider>
    )
}
'use client'

import { type ReactNode } from 'react'
import { AuthProvider } from '@/lib/store/auth-context'
import { PreferencesProvider } from '@/lib/store/preferences-context'
import { LibraryProvider } from '@/lib/store/library-context'
import { DiscoveryProvider } from '@/lib/store/discovery-context'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <LibraryProvider>
          <DiscoveryProvider>{children}</DiscoveryProvider>
        </LibraryProvider>
      </PreferencesProvider>
    </AuthProvider>
  )
}

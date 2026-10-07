'use client'

import { useMemo, type ReactNode } from 'react'
import { AuthProvider } from '@/lib/store/auth-context'
import { PreferencesProvider } from '@/lib/store/preferences-context'
import { LibraryProvider } from '@/lib/store/library-context'
import { DiscoveryProvider } from '@/lib/store/discovery-context'
import { createLibraryService } from '@/lib/services/libraryService'
import { MOVIES } from '@/lib/data/movies'

export function AppProviders({ children }: { children: ReactNode }) {
  const libraryService = useMemo(() => createLibraryService(MOVIES), [])
  return (
    <AuthProvider>
      <PreferencesProvider service={libraryService}>
        <LibraryProvider service={libraryService}>
          <DiscoveryProvider>{children}</DiscoveryProvider>
        </LibraryProvider>
      </PreferencesProvider>
    </AuthProvider>
  )
}

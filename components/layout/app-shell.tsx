'use client'

import { useState, type ReactNode } from 'react'
import { RequireAuth } from '@/components/layout/require-auth'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { SearchOverlay } from '@/components/layout/search-overlay'
import { LibrarySyncToaster } from '@/components/layout/library-sync-toaster'
import { MovieDetailsProvider } from '@/components/movies/movie-details-context'
import { PaywallModal } from '@/components/billing/paywall-modal'
import { ToastProvider } from '@/components/shared/toast'

/**
 * Authenticated application chrome: header, mobile tab bar, global search, the shared
 * movie-details modal and the upgrade sheet. Pages render inside <main>.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  return (
    <RequireAuth>
      <ToastProvider>
        <MovieDetailsProvider>
          <div className="relative flex min-h-dvh flex-col">
            <Header onOpenSearch={() => setSearchOpen(true)} />
            <main className="flex-1">{children}</main>
            <MobileNav onOpenSearch={() => setSearchOpen(true)} />
            <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
            <LibrarySyncToaster />
            <PaywallModal />
          </div>
        </MovieDetailsProvider>
      </ToastProvider>
    </RequireAuth>
  )
}

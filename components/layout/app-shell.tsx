'use client'

import { useState, type ReactNode } from 'react'
import { RequireAuth } from '@/components/layout/require-auth'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { SearchOverlay } from '@/components/layout/search-overlay'
import { MovieDetailsProvider } from '@/components/movies/movie-details-context'
import { ToastProvider } from '@/components/shared/toast'

/**
 * Authenticated application chrome: header, mobile tab bar, global search and
 * the shared movie-details modal. Pages render inside <main>.
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
          </div>
        </MovieDetailsProvider>
      </ToastProvider>
    </RequireAuth>
  )
}

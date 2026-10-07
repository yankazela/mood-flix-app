'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { IconButton } from '@/components/shared/icon-button'
import { UserMenu } from '@/components/layout/user-menu'
import { cn } from '@/lib/utils'

export const NAV_ITEMS = [
  { href: '/', label: 'Discover' },
  { href: '/my-movies', label: 'My Movies' },
  { href: '/history', label: 'History' },
] as const

interface HeaderProps {
  onOpenSearch: () => void
}

export function Header({ onOpenSearch }: HeaderProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={cn('sticky top-0 z-50 transition-all duration-300', scrolled ? 'border-b border-white/6 bg-ink/90 backdrop-blur-xl' : 'bg-transparent')}>
      <div className="page-gutter mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 sm:h-[72px]">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/70',
                    active ? 'text-white' : 'text-white/50 hover:text-white',
                  )}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-3.5 -bottom-0.5 h-px bg-brand" aria-hidden />}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <IconButton label="Search movies" variant="ghost" onClick={onOpenSearch}>
            <Search />
          </IconButton>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

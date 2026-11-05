'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Clock3, Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  onOpenSearch: () => void
}

const ITEMS = [
  { href: '/', label: 'nav.discover', icon: Sparkles },
  { href: '/my-movies', label: 'nav.myMovies', icon: Bookmark },
  { href: '/history', label: 'nav.history', icon: Clock3 },
] as const

/** Bottom tab bar for one-handed use on phones. */
export function MobileNav({ onOpenSearch }: MobileNavProps) {
  const { t } = useTranslation()
  const pathname = usePathname()
  return (
    <nav
      aria-label={t('nav.primaryMobile')}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/8 bg-ink/85 backdrop-blur-xl safe-bottom md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 px-2 pt-2">
        {ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn('flex flex-col items-center gap-1 rounded-xl py-1.5 text-center text-[11px] font-medium leading-tight transition-colors', active ? 'text-brand' : 'text-white/50 active:text-white')}
            >
              <Icon className={cn('size-5', active && 'fill-brand/20')} />
              {t(item.label)}
            </Link>
          )
        })}
        <button type="button" onClick={onOpenSearch} className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium text-white/50 active:text-white">
          <Search className="size-5" />
          {t('nav.search')}
        </button>
      </div>
    </nav>
  )
}

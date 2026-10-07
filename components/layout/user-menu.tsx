'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Clapperboard, Clock3, LogOut, Settings2, Shield, Tv } from 'lucide-react'
import { useAuth } from '@/lib/store/auth-context'
import { usePreferences } from '@/lib/store/preferences-context'
import { getProvider } from '@/lib/data/providers'
import { getCountry } from '@/lib/data/countries'
import { GENRE_MAP } from '@/lib/data/genres'
import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const { preferences } = usePreferences()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null

  const country = getCountry(preferences.country)
  const services = preferences.streamingProviders.map((id) => getProvider(id))

  // Once the session clears, RequireAuth sends the user to /login.
  const handleSignOut = () => {
    setOpen(false)
    signOut()
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-2.5 text-sm transition hover:border-white/20 hover:bg-white/8 outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
      >
        <Avatar name={user.fullName} />
        <span className="hidden max-w-[120px] truncate text-white/80 md:inline">{user.fullName.split(' ')[0]}</span>
        <ChevronDown className={cn('size-3.5 text-white/40 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-[60] w-72 overflow-hidden rounded-2xl border border-white/10 bg-surface-2 shadow-2xl animate-scale-in"
        >
          <div className="flex items-center gap-3 border-b border-white/6 p-4">
            <Avatar name={user.fullName} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.fullName}</p>
              <p className="truncate text-xs text-white/45">{user.email}</p>
            </div>
          </div>

          <div className="border-b border-white/6 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              <Tv className="size-3" /> Your services · {country.flag} {country.code}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {services.length === 0 && <span className="text-xs text-white/50">No services selected</span>}
              {services.map((service) => (
                <span key={service.id} className="rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: service.brandColor, color: service.textColor }}>
                  {service.shortName}
                </span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  <Clapperboard className="size-3" /> Genres
                </p>
                <p className="truncate text-xs text-white/75">
                  {preferences.favouriteGenres.length > 0 ? preferences.favouriteGenres.map((id) => GENRE_MAP[id]?.label ?? id).join(', ') : 'Not set'}
                </p>
              </div>
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  <Shield className="size-3" /> Rating
                </p>
                <p className="text-xs text-white/75">Up to {preferences.maxContentRating}</p>
              </div>
            </div>
          </div>

          <div className="p-1.5">
            <MenuItem href="/onboarding?edit=1" icon={<Settings2 />} onClick={() => setOpen(false)}>
              Edit services, genres and rating
            </MenuItem>
            <MenuItem href="/history" icon={<Clock3 />} onClick={() => setOpen(false)}>
              Recommendation history
            </MenuItem>
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/6 hover:text-white [&_svg]:size-4 [&_svg]:text-white/50"
            >
              <LogOut /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({ href, icon, children, onClick }: { href: string; icon: React.ReactNode; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/6 hover:text-white [&_svg]:size-4 [&_svg]:text-white/50"
    >
      {icon}
      {children}
    </Link>
  )
}

export function Avatar({ name, size = 'md', className }: { name: string; size?: 'md' | 'lg'; className?: string }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-[#9fd63a] font-bold text-brand-foreground',
        size === 'md' ? 'size-8 text-[11px]' : 'size-11 text-sm',
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}

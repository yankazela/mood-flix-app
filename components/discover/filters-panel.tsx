'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import type { DiscoveryFilters, MovieGenre, StreamingProviderId } from '@/lib/types'
import { STREAMING_PROVIDERS } from '@/lib/data/providers'
import { formatGenre, formatRuntime } from '@/lib/format'
import { usePreferences } from '@/lib/store/preferences-context'
import { useScrollLock } from '@/lib/hooks/use-scroll-lock'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import { Button } from '@/components/shared/button'
import { cn } from '@/lib/utils'

interface FiltersPanelProps {
  filters: DiscoveryFilters
  onChange: (filters: DiscoveryFilters) => void
  onReset: () => void
  activeCount: number
  disabled?: boolean
}

const GENRES: MovieGenre[] = ['comedy', 'drama', 'action', 'thriller', 'romance', 'science-fiction', 'animation', 'mystery', 'horror', 'adventure', 'family', 'crime']
const YEARS = [
  { label: 'Any year', value: undefined },
  { label: '2020s', value: 2020 },
  { label: '2010s and newer', value: 2010 },
  { label: '2000s and newer', value: 2000 },
  { label: '1990s and newer', value: 1990 },
]
const RATINGS = [6, 7, 7.5, 8]
const LANGUAGES = [
  { label: 'Any language', value: 'any' },
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'Korean', value: 'ko' },
  { label: 'Japanese', value: 'ja' },
]

const PANEL_WIDTH = 640
const VIEWPORT_GUTTER = 20

/**
 * Filters trigger + panel. The panel is portaled to <body> so it escapes the
 * prompt card's stacking context (backdrop-filter) and can sit above the
 * rest of the page: a popover anchored to the trigger on desktop, a bottom
 * sheet on phones.
 */
export function FiltersPanel({ filters, onChange, onReset, activeCount, disabled = false }: FiltersPanelProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [anchor, setAnchor] = useState<{ top: number; left: number; maxHeight: number } | null>(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { preferences } = usePreferences()
  useScrollLock(open && !isDesktop)

  useEffect(() => setMounted(true), [])

  const positionPanel = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const width = Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_GUTTER * 2)
    const left = Math.max(VIEWPORT_GUTTER, Math.min(rect.left, window.innerWidth - width - VIEWPORT_GUTTER))
    const top = rect.bottom + 10
    setAnchor({ top, left, maxHeight: Math.max(320, window.innerHeight - top - VIEWPORT_GUTTER) })
  }, [])

  useLayoutEffect(() => {
    if (!open || !isDesktop) return
    positionPanel()
    window.addEventListener('resize', positionPanel)
    return () => window.removeEventListener('resize', positionPanel)
  }, [open, isDesktop, positionPanel])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      setOpen(false)
    }
    const onScroll = () => isDesktop && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('scroll', onScroll)
    }
  }, [open, isDesktop])

  const patch = (next: Partial<DiscoveryFilters>) => onChange({ ...filters, ...next })
  const toggleGenre = (genre: MovieGenre) => {
    const current = filters.genres ?? []
    patch({ genres: current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre] })
  }
  const toggleProvider = (id: StreamingProviderId) => {
    const current = filters.providers ?? []
    patch({ providers: current.includes(id) ? current.filter((p) => p !== id) : [...current, id] })
  }

  const sortedProviders = [...STREAMING_PROVIDERS].sort((a, b) => {
    const aMine = preferences.streamingProviders.includes(a.id) ? 0 : 1
    const bMine = preferences.streamingProviders.includes(b.id) ? 0 : 1
    return aMine - bMine
  })

  const panel = (
    <>
      {!isDesktop && <div className="fixed inset-0 z-[70] bg-ink/70 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} aria-hidden />}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Filters"
        className={cn(
          'fixed z-[75] flex flex-col bg-surface-2 shadow-2xl ring-1 ring-white/10',
          isDesktop ? 'rounded-3xl animate-scale-in' : 'inset-x-0 bottom-0 max-h-[88dvh] rounded-t-[28px] animate-fade-up',
        )}
        style={isDesktop && anchor ? { top: anchor.top, left: anchor.left, width: Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_GUTTER * 2), maxHeight: anchor.maxHeight } : undefined}
      >
        <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-white">Fine-tune your results</h3>
            <p className="text-xs text-white/45">Your words still lead. These just narrow the field.</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="flex size-9 items-center justify-center rounded-full text-white/50 hover:bg-white/8 hover:text-white">
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 [scrollbar-width:thin]">
          <Field label="Maximum runtime" value={filters.maxRuntime ? formatRuntime(filters.maxRuntime) : 'Any length'}>
            <input
              type="range"
              min={75}
              max={185}
              step={5}
              value={filters.maxRuntime ?? 185}
              onChange={(event) => {
                const value = Number(event.target.value)
                patch({ maxRuntime: value >= 185 ? undefined : value })
              }}
              className="w-full accent-brand"
              aria-label="Maximum runtime"
            />
            <div className="mt-1 flex justify-between text-[11px] text-white/35">
              <span>1h 15m</span>
              <span>Any</span>
            </div>
          </Field>

          <Field label="Type">
            <Segmented
              options={[
                { label: 'Movies', value: 'movie' },
                { label: 'TV shows', value: 'tv' },
                { label: 'Both', value: 'all' },
              ]}
              value={filters.mediaType ?? 'all'}
              onChange={(value) => patch({ mediaType: value as DiscoveryFilters['mediaType'] })}
            />
          </Field>

          <Field label="Genre">
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <Chip key={genre} active={filters.genres?.includes(genre) ?? false} onClick={() => toggleGenre(genre)}>
                  {formatGenre(genre)}
                </Chip>
              ))}
            </div>
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Release year">
              <Select
                value={String(filters.releaseYearMin ?? '')}
                onChange={(value) => patch({ releaseYearMin: value ? Number(value) : undefined })}
                options={YEARS.map((year) => ({ label: year.label, value: year.value ? String(year.value) : '' }))}
              />
            </Field>
            <Field label="Language">
              <Select value={filters.language ?? 'any'} onChange={(value) => patch({ language: value === 'any' ? undefined : value })} options={LANGUAGES} />
            </Field>
          </div>

          <Field label="Minimum rating">
            <div className="flex flex-wrap gap-2">
              <Chip active={!filters.minRating} onClick={() => patch({ minRating: undefined })}>
                Any
              </Chip>
              {RATINGS.map((rating) => (
                <Chip key={rating} active={filters.minRating === rating} onClick={() => patch({ minRating: rating })}>
                  ★ {rating}+
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Streaming platform">
            <div className="flex flex-wrap gap-2">
              {sortedProviders.map((provider) => {
                const active = filters.providers?.includes(provider.id) ?? false
                return (
                  <Chip key={provider.id} active={active} onClick={() => toggleProvider(provider.id)}>
                    <span className="size-2 rounded-full" style={{ backgroundColor: provider.brandColor }} aria-hidden />
                    {provider.shortName}
                    {preferences.streamingProviders.includes(provider.id) && <span className="text-[10px] text-white/35">· yours</span>}
                  </Chip>
                )
              })}
            </div>
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/6 px-5 py-4 safe-bottom">
          <Button variant="ghost" size="sm" onClick={onReset} leadingIcon={<RotateCcw />} disabled={activeCount === 0}>
            Reset
          </Button>
          <Button size="md" onClick={() => setOpen(false)} leadingIcon={<Check />}>
            {activeCount > 0 ? `Apply ${activeCount} filter${activeCount === 1 ? '' : 's'}` : 'Done'}
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand/70 disabled:opacity-50',
          activeCount > 0 ? 'border-brand/60 bg-brand/15 text-brand' : 'border-white/10 bg-white/4 text-white/60 hover:border-white/20 hover:text-white',
        )}
      >
        <SlidersHorizontal className="size-3.5" />
        Filters
        {activeCount > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-brand-foreground">{activeCount}</span>}
      </button>
      {open && mounted && (isDesktop ? anchor !== null : true) && createPortal(panel, document.body)}
    </>
  )
}

function Field({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">{label}</span>
        {value && <span className="text-xs font-medium text-brand">{value}</span>}
      </div>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all',
        active ? 'border-brand bg-brand text-brand-foreground' : 'border-white/10 bg-white/4 text-white/70 hover:border-white/20 hover:text-white',
      )}
    >
      {children}
    </button>
  )
}

function Segmented({ options, value, onChange }: { options: { label: string; value: string }[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-ink/40 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn('h-8 rounded-lg px-3.5 text-xs font-medium transition-all', value === option.value ? 'bg-white text-ink' : 'text-white/60 hover:text-white')}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full appearance-none rounded-xl border border-white/10 bg-ink/40 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-opacity=%220.5%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:12px] bg-[position:right_12px_center] bg-no-repeat px-3 pr-9 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-surface-2 text-white">
          {option.label}
        </option>
      ))}
    </select>
  )
}

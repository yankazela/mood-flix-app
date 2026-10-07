'use client'

import 'flag-icons/css/flag-icons.min.css'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { AlertCircle, Check, ChevronDown, Search } from 'lucide-react'
import { WORLD_COUNTRIES, findWorldCountry, type WorldCountry } from '@/lib/data/world-countries'
import { cn } from '@/lib/utils'

interface CountryComboboxProps {
  label?: string
  /** ISO 3166-1 alpha-2, upper-case. */
  value: string
  onChange: (code: string) => void
  error?: string
  name?: string
  disabled?: boolean
}

export function Flag({ code, className }: { code: string; className?: string }) {
  return <span className={cn('fi shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.12)]', `fi-${code.toLowerCase()}`, className)} aria-hidden />
}

/** Searchable country picker (ARIA combobox + listbox) with flag-icons flags. */
export function CountryCombobox({ label = 'Country', value, onChange, error, name = 'country', disabled = false }: CountryComboboxProps) {
  const id = useId()
  const listId = `${id}-list`
  const errorId = `${id}-error`
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const selected = findWorldCountry(value)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return WORLD_COUNTRIES
    const starts: WorldCountry[] = []
    const contains: WorldCountry[] = []
    for (const country of WORLD_COUNTRIES) {
      const n = country.name.toLowerCase()
      if (n.startsWith(q) || country.code.toLowerCase() === q) starts.push(country)
      else if (n.includes(q)) contains.push(country)
    }
    return [...starts, ...contains]
  }, [query])

  const openList = () => {
    if (disabled) return
    setQuery('')
    setOpen(true)
    const index = WORLD_COUNTRIES.findIndex((country) => country.code === value)
    setActive(index >= 0 ? index : 0)
  }

  const close = (focusTrigger = true) => {
    setOpen(false)
    if (focusTrigger) triggerRef.current?.focus()
  }

  const choose = (country: WorldCountry) => {
    onChange(country.code)
    close()
  }

  useEffect(() => {
    if (!open) return
    searchRef.current?.focus()
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActive(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActive(results.length - 1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (results[active]) choose(results[active])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Tab') {
      close(false)
    }
  }

  return (
    <div ref={rootRef} className="relative space-y-1.5">
      <label htmlFor={`${id}-trigger`} className="text-[13px] font-medium text-white/80">
        {label}
      </label>
      <button
        ref={triggerRef}
        id={`${id}-trigger`}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(event) => {
          if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault()
            openList()
          }
        }}
        className={cn(
          'flex h-12 w-full items-center gap-3 rounded-xl border bg-white/4 px-4 text-left text-[15px] outline-none transition-all',
          'focus-visible:border-brand/60 focus-visible:bg-white/6 focus-visible:ring-4 focus-visible:ring-brand/10 disabled:opacity-50',
          error ? 'border-destructive/60' : open ? 'border-brand/60 ring-4 ring-brand/10' : 'border-white/10 hover:border-white/20',
        )}
      >
        {selected ? (
          <>
            <Flag code={selected.code} className="text-[1.05rem]" />
            <span className="min-w-0 flex-1 truncate text-white">{selected.name}</span>
            <span className="text-xs font-medium tabular-nums text-white/35">{selected.code}</span>
          </>
        ) : (
          <span className="flex-1 text-white/30">Select your country</span>
        )}
        <ChevronDown className={cn('size-4 shrink-0 text-white/40 transition-transform', open && 'rotate-180')} />
      </button>
      {/* Lets plain form submissions and tests read the ISO code. */}
      <input type="hidden" name={name} value={value} />

      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-2xl border border-white/10 bg-surface-2 shadow-2xl animate-scale-in">
          <div className="flex items-center gap-2.5 border-b border-white/6 px-3.5">
            <Search className="size-4 shrink-0 text-white/35" aria-hidden />
            <input
              ref={searchRef}
              role="combobox"
              aria-label="Search countries"
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={results[active] ? `${id}-opt-${results[active].code}` : undefined}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setActive(0)
              }}
              onKeyDown={onSearchKeyDown}
              placeholder="Search countries"
              autoComplete="off"
              className="h-11 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
          </div>
          <ul ref={listRef} id={listId} role="listbox" aria-label={label} className="max-h-64 overflow-y-auto py-1.5 [scrollbar-width:thin]">
            {results.length === 0 && <li className="px-4 py-6 text-center text-sm text-white/40">No country matches “{query}”.</li>}
            {results.map((country, index) => {
              const isSelected = country.code === value
              return (
                <li
                  key={country.code}
                  id={`${id}-opt-${country.code}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(country)}
                  className={cn(
                    'mx-1.5 flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors [contain-intrinsic-size:auto_36px] [content-visibility:auto]',
                    index === active ? 'bg-white/8 text-white' : 'text-white/75',
                  )}
                >
                  <Flag code={country.code} className="text-base" />
                  <span className="min-w-0 flex-1 truncate">{country.name}</span>
                  <span className="text-[11px] tabular-nums text-white/30">{country.code}</span>
                  {isSelected && <Check className="size-3.5 text-brand" strokeWidth={3} />}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-xs text-destructive animate-fade-in">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
    </div>
  )
}

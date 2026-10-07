'use client'

import 'flag-icons/css/flag-icons.min.css'
import { ChevronDown, Globe } from 'lucide-react'
import type { CountryCode } from '@/lib/types'
import { WORLD_COUNTRIES } from '@/lib/data/world-countries'

interface CountrySelectProps {
  value: CountryCode
  onChange: (code: CountryCode) => void
}

export function CountrySelect({ value, onChange }: CountrySelectProps) {
  const current = WORLD_COUNTRIES.find((country) => country.code === value) ?? WORLD_COUNTRIES[0]
  return (
    <label className="group relative flex h-14 cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-surface/70 px-4 transition hover:border-white/20 focus-within:border-brand/60 focus-within:ring-4 focus-within:ring-brand/10">
      <span
        className={`fi fi-${current.code.toLowerCase()} shrink-0 overflow-hidden rounded-[3px] text-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.12)]`}
        aria-label={current.name}
        role="img"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
          <Globe className="size-3" /> Country / region
        </span>
        <span className="truncate text-sm font-medium text-white">{current.name}</span>
      </span>
      <ChevronDown className="size-4 text-white/40" aria-hidden />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as CountryCode)}
        aria-label="Country or region"
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {WORLD_COUNTRIES.map((country) => (
          <option key={country.code} value={country.code} className="bg-surface-2 text-white">
            {country.name}
          </option>
        ))}
      </select>
    </label>
  )
}

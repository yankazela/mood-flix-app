import type { Country, CountryCode } from '@/lib/types'
import { findWorldCountry } from '@/lib/data/world-countries'
import { currentLocale } from '@/lib/i18n'

/** The countries the catalogue is built for. Flags are drawn from the code by `<Flag />`, never stored. */
export const COUNTRIES: Country[] = [
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'AU', name: 'Australia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
]

export const DEFAULT_COUNTRY: CountryCode = 'CA'

/** A country's name in the interface language; the English name when the platform cannot say. */
export function countryName(code: string, fallback?: string): string {
  try {
    const name = new Intl.DisplayNames([currentLocale()], { type: 'region' }).of(code.toUpperCase())
    if (name && name !== code.toUpperCase()) return name
  } catch {
    // older engines
  }
  return fallback ?? findWorldCountry(code)?.name ?? code.toUpperCase()
}

export function getCountry(code: CountryCode): Country {
  const known = COUNTRIES.find((country) => country.code === code) ?? findWorldCountry(code) ?? COUNTRIES[0]
  return { ...known, name: countryName(known.code, known.name) }
}

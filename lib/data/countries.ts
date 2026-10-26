import type { Country, CountryCode } from '@/lib/types'
import { findWorldCountry } from '@/lib/data/world-countries'

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

export function getCountry(code: CountryCode): Country {
  return COUNTRIES.find((country) => country.code === code) ?? findWorldCountry(code) ?? COUNTRIES[0]
}

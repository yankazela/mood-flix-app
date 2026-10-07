import type { Country, CountryCode } from '@/lib/types'
import { findWorldCountry } from '@/lib/data/world-countries'

export const COUNTRIES: Country[] = [
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
]

export const DEFAULT_COUNTRY: CountryCode = 'CA'

export function getCountry(code: CountryCode): Country {
  const known = COUNTRIES.find((country) => country.code === code)
  if (known) return known

  const worldCountry = findWorldCountry(code)
  if (!worldCountry) return COUNTRIES[0]
  const flag = Array.from(worldCountry.code, (letter) => String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65)).join('')
  return { ...worldCountry, flag }
}

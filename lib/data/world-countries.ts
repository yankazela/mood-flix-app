import flagIconCountries from 'flag-icons/country.json'

/** A country selectable at sign-up. `code` is the ISO 3166-1 alpha-2 code, upper-case (e.g. "CA"). */
export interface WorldCountry {
  code: string
  name: string
}

interface FlagIconCountry {
  code: string
  name: string
  iso: boolean
}

/** Every ISO 3166-1 country flag-icons has a flag for, sorted by name. */
export const WORLD_COUNTRIES: WorldCountry[] = (flagIconCountries as FlagIconCountry[])
  .filter((country) => country.iso && /^[a-z]{2}$/.test(country.code))
  .map((country) => ({ code: country.code.toUpperCase(), name: country.name }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en'))

const BY_CODE = new Map(WORLD_COUNTRIES.map((country) => [country.code, country]))

export function findWorldCountry(code: string | undefined | null): WorldCountry | undefined {
  return code ? BY_CODE.get(code.toUpperCase()) : undefined
}

/** Best guess from the browser locale, e.g. "en-CA" → "CA". Client-only. */
export function detectCountryCode(): string | undefined {
  if (typeof navigator === 'undefined') return undefined
  for (const tag of navigator.languages ?? [navigator.language]) {
    try {
      const region = new Intl.Locale(tag).maximize().region
      if (region && BY_CODE.has(region)) return region
    } catch {
      // ignore malformed locale tags
    }
  }
  return undefined
}

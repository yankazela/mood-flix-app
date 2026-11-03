import type { Movie } from '@/lib/types'
import i18n, { currentLocale, regionalTag, t } from '@/lib/i18n'

export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes) return ''
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return t('format.minutes', { minutes: mins })
  if (mins === 0) return t('format.hours', { hours })
  return t('format.hoursMinutes', { hours, minutes: mins })
}

export function formatRating(rating: number): string {
  return rating.toLocaleString(regionalTag(), { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export function formatNumber(value: number): string {
  return value.toLocaleString(regionalTag())
}

const GENRE_ALIASES: Record<string, string> = {
  'science fiction': 'science-fiction',
  'sci-fi': 'science-fiction',
}

const GENRE_LABELS_EN: Record<string, string> = {
  'sci-fi & fantasy': 'Sci-Fi & Fantasy',
  'action & adventure': 'Action & Adventure',
  'war & politics': 'War & Politics',
  tv_movie: 'TV Movie',
  'tv movie': 'TV Movie',
}

/** A display label for a genre id ("science-fiction") or a catalogue name ("action & adventure"), in the interface language where we have one. */
export function formatGenre(genre: string): string {
  const lower = genre.toLowerCase()
  const id = GENRE_ALIASES[lower] ?? lower
  const key = `data.genres.${id}.label`
  if (i18n.exists(key)) return t(key)
  // Compound catalogue names: translate each half we know, e.g. "action & adventure".
  if (lower.includes('&')) {
    const parts = lower.split('&').map((part) => part.trim())
    if (parts.every((part) => i18n.exists(`data.genres.${GENRE_ALIASES[part] ?? part}.label`))) {
      return parts.map((part) => t(`data.genres.${GENRE_ALIASES[part] ?? part}.label`)).join(' & ')
    }
  }
  const known = GENRE_LABELS_EN[lower]
  if (known) return known
  return genre
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => (word === '&' ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')
}

export function formatGenres(genres: string[], max = 2, separator = ' · '): string {
  return genres.slice(0, max).map(formatGenre).join(separator)
}

/** "2021 · 1h 43m · Comedy · Drama": whichever parts the title has. */
export function movieMeta(movie: Pick<Movie, 'releaseYear' | 'runtimeMinutes' | 'genres'>, genreCount = 2): string {
  return [movie.releaseYear, formatRuntime(movie.runtimeMinutes), formatGenres(movie.genres, genreCount)].filter(Boolean).join(' · ')
}

export function formatRelativeDate(iso: string, now = new Date()): string {
  const date = new Date(iso)
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return t('history.today')
  if (diffDays === 1) return t('history.yesterday')
  if (diffDays < 7) return t('history.daysAgo', { count: diffDays })
  return date.toLocaleDateString(regionalTag(), { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString(regionalTag(), { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(regionalTag(), { hour: 'numeric', minute: '2-digit' })
}

/** "a, b and c" in the interface language. */
export function joinNatural(items: string[]): string {
  if (items.length === 0) return ''
  try {
    return new Intl.ListFormat(currentLocale(), { style: 'long', type: 'conjunction' }).format(items)
  } catch {
    if (items.length === 1) return items[0]
    return `${items.slice(0, -1).join(', ')} ${t('common.and')} ${items[items.length - 1]}`
  }
}

export function initials(name: string): string {
  return name ? name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') : ''
}

/** A language's name in the interface language, e.g. "fr" is "French", "francés" or "français". */
export function formatLanguage(code: string): string {
  try {
    const name = new Intl.DisplayNames([currentLocale()], { type: 'language' }).of(code)
    if (name && name !== code) return name.charAt(0).toUpperCase() + name.slice(1)
  } catch {
    // older engines: fall back to the code
  }
  return code.toUpperCase()
}

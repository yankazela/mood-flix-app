import type { Movie } from '@/lib/types'

export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes) return ''
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

const GENRE_LABELS: Record<string, string> = {
  'science-fiction': 'Sci-Fi',
  'science fiction': 'Sci-Fi',
  'sci-fi & fantasy': 'Sci-Fi & Fantasy',
  'action & adventure': 'Action & Adventure',
  'war & politics': 'War & Politics',
  tv_movie: 'TV Movie',
  'tv movie': 'TV Movie',
}

/** A display label for a genre id ("science-fiction") or a catalogue name ("action & adventure"). */
export function formatGenre(genre: string): string {
  const known = GENRE_LABELS[genre.toLowerCase()]
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
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

/** "a, b and c" */
export function joinNatural(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

export function initials(name: string): string {
  return name ? name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') : ''
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  fr: 'French',
  ko: 'Korean',
  ja: 'Japanese',
  es: 'Spanish',
  de: 'German',
  hi: 'Hindi',
  pt: 'Portuguese',
}

export function formatLanguage(code: string): string {
  return LANGUAGE_LABELS[code] ?? code.toUpperCase()
}

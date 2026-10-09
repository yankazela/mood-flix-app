import type { MovieGenre } from '@/lib/types'

export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

const GENRE_LABELS: Record<MovieGenre, string> = {
  action: 'Action',
  adventure: 'Adventure',
  animation: 'Animation',
  comedy: 'Comedy',
  crime: 'Crime',
  drama: 'Drama',
  family: 'Family',
  fantasy: 'Fantasy',
  history: 'History',
  horror: 'Horror',
  music: 'Music',
  mystery: 'Mystery',
  romance: 'Romance',
  'science-fiction': 'Sci-Fi',
  thriller: 'Thriller',
  war: 'War',
}

export function formatGenre(genre: MovieGenre): string {
  return GENRE_LABELS[genre] ?? genre
}

export function formatGenres(genres: MovieGenre[], max = 2, separator = ' · '): string {
  return genres.slice(0, max).map(formatGenre).join(separator)
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

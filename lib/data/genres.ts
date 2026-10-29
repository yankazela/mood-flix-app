import type { MovieGenre } from '@/lib/types'

export interface GenreOption {
  id: MovieGenre
  label: string
  emoji: string
  blurb: string
  /** Illustration under public/ shown on the onboarding card instead of the emoji, when there is one. */
  image?: string
}

/** Genres offered during onboarding, in display order. */
export const GENRE_OPTIONS: GenreOption[] = [
  { id: 'comedy', label: 'Comedy', emoji: '😂', blurb: 'Make me laugh', image: '/comedy.png' },
  { id: 'drama', label: 'Drama', emoji: '🎭', blurb: 'Make me feel', image: '/drama.png' },
  { id: 'action', label: 'Action', emoji: '💥', blurb: 'Keep it moving', image: '/action.png' },
  { id: 'thriller', label: 'Thriller', emoji: '🔪', blurb: 'Edge of my seat', image: '/thriller.png' },
  { id: 'romance', label: 'Romance', emoji: '💘', blurb: 'Love stories', image: '/romance.png' },
  { id: 'science-fiction', label: 'Sci-Fi', emoji: '🚀', blurb: 'Big ideas', image: '/sci-fi.png' },
  { id: 'animation', label: 'Animation', emoji: '🎨', blurb: 'Drawn worlds', image: '/animation.png' },
  { id: 'mystery', label: 'Mystery', emoji: '🕵️', blurb: 'Whodunits', image: '/mystery.png' },
  { id: 'horror', label: 'Horror', emoji: '👻', blurb: 'Scare me' },
  { id: 'adventure', label: 'Adventure', emoji: '🧭', blurb: 'Take me places' },
  { id: 'family', label: 'Family', emoji: '🧸', blurb: 'For everyone' },
  { id: 'crime', label: 'Crime', emoji: '🚔', blurb: 'Heists and cops' },
  { id: 'fantasy', label: 'Fantasy', emoji: '🐉', blurb: 'Magic and myth' },
  { id: 'music', label: 'Music', emoji: '🎵', blurb: 'Songs and rhythm' },
]

export const GENRE_MAP: Record<string, GenreOption> = Object.fromEntries(GENRE_OPTIONS.map((g) => [g.id, g]))

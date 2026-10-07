import type { ContentRating } from '@/lib/types'

export interface ContentRatingOption {
  id: ContentRating
  rank: number
  title: string
  description: string
}

export const CONTENT_RATINGS: ContentRatingOption[] = [
  { id: 'G', rank: 0, title: 'All ages', description: 'Gentle films with nothing to worry about.' },
  { id: 'PG', rank: 1, title: 'Family friendly', description: 'Mild themes. Fine with kids in the room.' },
  { id: 'PG-13', rank: 2, title: 'Teens and up', description: 'Some intensity, language or violence.' },
  { id: 'R', rank: 3, title: 'Everything', description: 'Adult themes welcome. Show me it all.' },
]

export const DEFAULT_CONTENT_RATING: ContentRating = 'R'

const RANK: Record<ContentRating, number> = Object.fromEntries(CONTENT_RATINGS.map((r) => [r.id, r.rank])) as Record<ContentRating, number>

export function contentRatingRank(rating: ContentRating): number {
  return RANK[rating] ?? 0
}

/** True when a movie's rating is at or below the user's comfort ceiling. */
export function isWithinContentRating(movieRating: ContentRating, max: ContentRating | undefined): boolean {
  if (!max) return true
  return contentRatingRank(movieRating) <= contentRatingRank(max)
}

export function getContentRating(id: ContentRating): ContentRatingOption {
  return CONTENT_RATINGS.find((r) => r.id === id) ?? CONTENT_RATINGS[CONTENT_RATINGS.length - 1]
}

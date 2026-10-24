import type { Movie } from '@/lib/types'
import type { ApiItem } from '@/lib/api/types'
import { apiGet } from '@/lib/api/client'
import { toMovie } from '@/lib/api/adapters'

/** The API takes at most this many ids per request. */
const MAX_IDS_PER_CALL = 50

export async function fetchMovie(id: string): Promise<Movie> {
  const { item } = await apiGet<{ item: ApiItem }>(`/movies/${encodeURIComponent(id)}`)
  return toMovie(item)
}

/** The titles that still exist in the catalogue, in the order asked for. */
export async function fetchMovies(ids: string[]): Promise<Movie[]> {
  const unique = [...new Set(ids)]
  if (unique.length === 0) return []
  const batches: string[][] = []
  for (let start = 0; start < unique.length; start += MAX_IDS_PER_CALL) batches.push(unique.slice(start, start + MAX_IDS_PER_CALL))
  const pages = await Promise.all(batches.map((batch) => apiGet<{ items: ApiItem[] }>('/movies', { ids: batch })))
  return pages.flatMap((page) => page.items.map(toMovie))
}

export async function searchMovies(query: string, limit = 8): Promise<Movie[]> {
  const q = query.trim()
  if (!q) return []
  const { items } = await apiGet<{ items: ApiItem[] }>('/movies/search', { q, limit })
  return items.map(toMovie)
}

export interface PopularOptions {
  sort?: 'popularity' | 'rating'
  /** The user's own service ids; only titles on one of them are listed. */
  services?: string[]
  limit?: number
}

export async function fetchPopular({ sort = 'popularity', services, limit = 12 }: PopularOptions = {}): Promise<Movie[]> {
  const { items } = await apiGet<{ items: ApiItem[] }>('/movies/popular', { sort, services, limit })
  return items.map(toMovie)
}

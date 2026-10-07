/**
 * TMDB image helpers.
 *
 * Movies store TMDB-style `posterPath` / `backdropPath` values so that when the
 * real TMDB API is wired up, the data shape doesn't change. Only the fetching
 * layer (movieService) will.
 *
 * Image CDN access requires no API key, so this is safe to run client-side.
 */

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export type PosterSize = 'w185' | 'w342' | 'w500' | 'w780' | 'original'
export type BackdropSize = 'w780' | 'w1280' | 'original'

export function posterUrl(path: string | null | undefined, size: PosterSize = 'w500'): string | null {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export function backdropUrl(path: string | null | undefined, size: BackdropSize = 'w1280'): string | null {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

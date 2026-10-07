import type { Movie } from '@/lib/types'
import { MOVIES } from '@/lib/data/movies'
import { delay } from '@/lib/storage'

/**
 * Movie catalog service.
 *
 * Today this reads from the in-memory mock catalog. The future implementation
 * will proxy TMDB through a server route so the API key never ships to the
 * browser. Keep every consumer on this interface.
 */
export interface MovieService {
  getMovies(): Promise<Movie[]>
  getMovieById(id: string): Promise<Movie | null>
  getMoviesByIds(ids: string[]): Promise<Movie[]>
  searchMovies(query: string): Promise<Movie[]>
}

class MockMovieService implements MovieService {
  async getMovies(): Promise<Movie[]> {
    return MOVIES
  }

  async getMovieById(id: string): Promise<Movie | null> {
    await delay(120)
    return MOVIES.find((movie) => movie.id === id) ?? null
  }

  async getMoviesByIds(ids: string[]): Promise<Movie[]> {
    const byId = new Map(MOVIES.map((movie) => [movie.id, movie]))
    return ids.map((id) => byId.get(id)).filter((movie): movie is Movie => Boolean(movie))
  }

  async searchMovies(query: string): Promise<Movie[]> {
    await delay(150)
    const needle = query.trim().toLowerCase()
    if (!needle) return []
    return MOVIES.filter(
      (movie) =>
        movie.title.toLowerCase().includes(needle) ||
        movie.director.toLowerCase().includes(needle) ||
        movie.cast.some((member) => member.name.toLowerCase().includes(needle)) ||
        movie.genres.some((genre) => genre.includes(needle)),
    ).slice(0, 8)
  }
}

export const movieService: MovieService = new MockMovieService()

/** Synchronous helpers for places that already have the catalog in scope. */
export function findMovie(id: string): Movie | undefined {
  return MOVIES.find((movie) => movie.id === id)
}

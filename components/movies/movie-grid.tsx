'use client'

import type { Movie } from '@/lib/types'
import { MovieCard } from '@/components/movies/movie-card'
import { cn } from '@/lib/utils'

interface MovieGridProps {
  movies: Movie[]
  className?: string
}

export function MovieGrid({ movies, className }: MovieGridProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7', className)}>
      {movies.map((movie, index) => (
        <MovieCard key={movie.id} movie={movie} fluid index={index} />
      ))}
    </div>
  )
}

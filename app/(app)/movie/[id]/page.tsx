'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getMovie } from '@/lib/data/movies'
import { MovieDetails } from '@/components/movies/movie-details'
import { buttonStyles } from '@/components/shared/button'

export default function MoviePage() {
  const params = useParams<{ id: string }>()
  const movie = getMovie(params.id)

  if (!movie) {
    return (
      <div className="page-gutter flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-medium text-white">We couldn’t find that movie</h1>
        <p className="text-sm text-white/50">It may have been removed from the catalog.</p>
        <Link href="/" className={buttonStyles({ variant: 'secondary' })}>
          Back to Discover
        </Link>
      </div>
    )
  }

  return (
    <div className="-mt-16 sm:-mt-[72px] pb-24 md:pb-0">
      <MovieDetails movie={movie} variant="page" />
    </div>
  )
}

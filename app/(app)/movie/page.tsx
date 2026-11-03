'use client'

import { useLocale } from '@/lib/i18n/language-context'
import { useTranslation } from 'react-i18next'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { Movie } from '@/lib/types'
import { fetchMovie } from '@/lib/api/movies'
import { useAsync } from '@/lib/hooks/use-async'
import { MovieDetails } from '@/components/movies/movie-details'
import { Splash } from '@/components/layout/require-auth'
import { buttonStyles } from '@/components/shared/button'

export default function MoviePage() {
  return (
    <Suspense fallback={<Splash />}>
      <MovieContent />
    </Suspense>
  )
}

/** Served at /movie?id=<item id>; static export cannot prebuild a page per catalogue item. */
function MovieContent() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const id = useSearchParams().get('id') ?? ''
  const { data: movie, loading, error } = useAsync<Movie | null>(
    () => (id ? fetchMovie(id) : Promise.reject(new Error(t('movie.noMovieSelected')))),
    `${locale}:${id}`,
    null,
  )

  if (loading) return <Splash />

  if (!movie) {
    return (
      <div className="page-gutter flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-medium text-white">{t('movie.notFound')}</h1>
        <p className="text-sm text-white/50">{error ?? t('movie.removed')}</p>
        <Link href="/" className={buttonStyles({ variant: 'secondary' })}>
          {t('common.backToDiscover')}
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

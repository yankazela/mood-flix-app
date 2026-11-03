'use client'

import { useTranslation } from 'react-i18next'
import { Bookmark } from 'lucide-react'
import { useLibrary } from '@/lib/store/library-context'
import { MovieRow } from '@/components/movies/movie-row'

/** The user's saved titles, newest first, as a row on the Discover page. */
export function SavedMovies() {
  const { t } = useTranslation()
  const { savedMovies } = useLibrary()

  if (savedMovies.length === 0) return null

  return (
    <MovieRow
      className="pb-8"
      title={
        <span className="inline-flex items-center gap-2">
          <Bookmark className="size-5 text-brand" /> {t('discover.saved.title')}
        </span>
      }
      subtitle={t('discover.saved.subtitle')}
      items={savedMovies.map((movie) => ({ movie }))}
      cardSize="md"
    />
  )
}

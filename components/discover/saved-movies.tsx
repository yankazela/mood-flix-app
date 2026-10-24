'use client'

import { Bookmark } from 'lucide-react'
import { useLibrary } from '@/lib/store/library-context'
import { MovieRow } from '@/components/movies/movie-row'

/** The user's saved titles, newest first, as a row on the Discover page. */
export function SavedMovies() {
  const { savedMovies } = useLibrary()

  if (savedMovies.length === 0) return null

  return (
    <MovieRow
      className="pb-8"
      title={
        <span className="inline-flex items-center gap-2">
          <Bookmark className="size-5 text-brand" /> Saved for later
        </span>
      }
      subtitle="Movies you’ve saved. They’re waiting for the right mood."
      items={savedMovies.map((movie) => ({ movie }))}
      cardSize="md"
    />
  )
}

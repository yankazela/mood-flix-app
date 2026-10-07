'use client'

import { useCallback } from 'react'
import type { Movie } from '@/lib/types'
import { useLibrary } from '@/lib/store/library-context'
import { useToast } from '@/components/shared/toast'

/** Bundles the per-movie library actions with user-facing confirmations. */
export function useMovieActions(movie: Movie) {
  const library = useLibrary()
  const toast = useToast()
  const feedback = library.getFeedback(movie.id)

  const saved = Boolean(feedback?.saved)
  const liked = feedback?.liked === true
  const disliked = feedback?.liked === false
  const watched = Boolean(feedback?.watched)

  const toggleSaved = useCallback(() => {
    library.toggleSaved(movie.id)
    toast.show(saved ? `Removed “${movie.title}” from My Movies` : `Saved “${movie.title}” to My Movies`, saved ? 'default' : 'success')
  }, [library, movie.id, movie.title, saved, toast])

  const like = useCallback(() => {
    library.setLiked(movie.id, true)
    if (!liked) toast.show(`Liked “${movie.title}”. We’ll find more like it.`, 'success')
  }, [library, movie.id, movie.title, liked, toast])

  const dislike = useCallback(() => {
    library.setLiked(movie.id, false)
    if (!disliked) toast.show(`Got it. Fewer movies like “${movie.title}”.`)
  }, [library, movie.id, movie.title, disliked, toast])

  const toggleWatched = useCallback(() => {
    library.toggleWatched(movie.id)
    toast.show(watched ? `Marked “${movie.title}” as not watched` : `Marked “${movie.title}” as watched`)
  }, [library, movie.id, movie.title, watched, toast])

  return { feedback, saved, liked, disliked, watched, toggleSaved, like, dislike, toggleWatched }
}

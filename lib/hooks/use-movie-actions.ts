'use client'

import { useCallback } from 'react'
import type { Movie } from '@/lib/types'
import { useLibrary } from '@/lib/store/library-context'
import { useDiscovery } from '@/lib/store/discovery-context'
import { useToast } from '@/components/shared/toast'

/** Bundles the per-movie library actions with user-facing confirmations. */
export function useMovieActions(movie: Movie) {
  const library = useLibrary()
  const { response } = useDiscovery()
  const toast = useToast()
  const feedback = library.getFeedback(movie.id)

  const saved = Boolean(feedback?.saved)
  const liked = feedback?.liked === true
  const disliked = feedback?.liked === false
  const watched = Boolean(feedback?.watched)

  // A thumbs vote is tied to the recommendation it came from, when the title is on screen as one.
  const requestId = response?.recommendations.some((rec) => rec.movie.id === movie.id) ? response.id : undefined

  const toggleSaved = useCallback(() => {
    library.toggleSaved(movie)
    toast.show(saved ? `Removed “${movie.title}” from My Movies` : `Saved “${movie.title}” to My Movies`, saved ? 'default' : 'success')
  }, [library, movie, saved, toast])

  const like = useCallback(() => {
    library.setLiked(movie, true, requestId)
    if (!liked) toast.show(`Liked “${movie.title}”. We’ll find more like it.`, 'success')
  }, [library, movie, liked, requestId, toast])

  const dislike = useCallback(() => {
    library.setLiked(movie, false, requestId)
    if (!disliked) toast.show(`Got it. Fewer movies like “${movie.title}”.`)
  }, [library, movie, disliked, requestId, toast])

  const toggleWatched = useCallback(() => {
    library.toggleWatched(movie)
    toast.show(watched ? `Marked “${movie.title}” as not watched` : `Marked “${movie.title}” as watched`)
  }, [library, movie, watched, toast])

  return { feedback, saved, liked, disliked, watched, toggleSaved, like, dislike, toggleWatched }
}

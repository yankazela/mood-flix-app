'use client'

import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import type { Movie } from '@/lib/types'
import { useLibrary } from '@/lib/store/library-context'
import { useDiscovery } from '@/lib/store/discovery-context'
import { useToast } from '@/components/shared/toast'

/** Bundles the per-movie library actions with user-facing confirmations. */
export function useMovieActions(movie: Movie) {
  const { t } = useTranslation()
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
    toast.show(saved ? t('toasts.removedSaved', { title: movie.title }) : t('toasts.savedTo', { title: movie.title }), saved ? 'default' : 'success')
  }, [library, movie, saved, toast, t])

  const like = useCallback(() => {
    library.setLiked(movie, true, requestId)
    if (!liked) toast.show(t('toasts.liked', { title: movie.title }), 'success')
  }, [library, movie, liked, requestId, toast, t])

  const dislike = useCallback(() => {
    library.setLiked(movie, false, requestId)
    if (!disliked) toast.show(t('toasts.disliked', { title: movie.title }))
  }, [library, movie, disliked, requestId, toast, t])

  const toggleWatched = useCallback(() => {
    library.toggleWatched(movie)
    toast.show(watched ? t('toasts.markedUnwatched', { title: movie.title }) : t('toasts.markedWatched', { title: movie.title }))
  }, [library, movie, watched, toast, t])

  return { feedback, saved, liked, disliked, watched, toggleSaved, like, dislike, toggleWatched }
}

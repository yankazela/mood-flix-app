'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bookmark, BookmarkCheck, Clock, Eye, Play, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import type { Movie, Recommendation } from '@/lib/types'
import { backdropUrl, posterUrl } from '@/lib/tmdb'
import { formatGenre, formatLanguage, formatRuntime } from '@/lib/format'
import { availableProviders } from '@/lib/recommendation/engine'
import { getProvider } from '@/lib/data/providers'
import { getCountry } from '@/lib/data/countries'
import { usePreferences } from '@/lib/store/preferences-context'
import { useLibrary } from '@/lib/store/library-context'
import { useDiscovery } from '@/lib/store/discovery-context'
import { useMovieActions } from '@/lib/hooks/use-movie-actions'
import { useToast } from '@/components/shared/toast'
import { Button } from '@/components/shared/button'
import { IconButton } from '@/components/shared/icon-button'
import { PosterImage } from '@/components/movies/poster-image'
import { MatchBadge } from '@/components/movies/match-badge'
import { RatingBadge } from '@/components/movies/rating-badge'
import { StreamingProviderBadge } from '@/components/movies/streaming-provider-badge'
import { EmotionalProfile } from '@/components/movies/emotional-profile'
import { RecommendationReason } from '@/components/movies/recommendation-reason'
import { FeedbackPanel } from '@/components/feedback/feedback-panel'
import { cn } from '@/lib/utils'

interface MovieDetailsProps {
  movie: Movie
  recommendation?: Recommendation
  variant?: 'modal' | 'page'
  onClose?: () => void
}

export function MovieDetails({ movie, recommendation, variant = 'modal', onClose }: MovieDetailsProps) {
  const { preferences } = usePreferences()
  const library = useLibrary()
  const { response, historyId } = useDiscovery()
  const toast = useToast()
  const { saved, liked, disliked, watched, toggleSaved, like, dislike, toggleWatched } = useMovieActions(movie)
  const [launching, setLaunching] = useState(false)

  const providers = availableProviders(movie, preferences.country, preferences.streamingProviders)
  const primaryProvider = providers[0] ? getProvider(providers[0]) : null
  const country = getCountry(preferences.country)
  const backdrop = backdropUrl(movie.backdropPath, 'w1280')
  const blurredPoster = posterUrl(movie.posterPath, 'w342')

  // Was this movie part of the recommendation set currently on screen?
  const inCurrentResponse =
    response?.recommendations.some((rec) => rec.movie.id === movie.id) ||
    response?.sections.some((section) => section.recommendations.some((rec) => rec.movie.id === movie.id))
  const activeHistoryId = inCurrentResponse ? historyId : null

  const handleWatch = () => {
    setLaunching(true)
    if (activeHistoryId) library.recordSelection(activeHistoryId, movie.id)
    if (!watched) library.toggleWatched(movie.id)
    const where = primaryProvider ? primaryProvider.name : 'your streaming service'
    toast.show(`Opening “${movie.title}” on ${where}… (demo)`, 'success')
    setTimeout(() => setLaunching(false), 1400)
  }

  return (
    <div className={cn('relative text-white', variant === 'page' ? 'min-h-dvh' : '')}>
      {/* ───── Cinematic hero ───── */}
      <div className={cn('relative overflow-hidden', variant === 'page' ? 'h-[52vh] min-h-[380px] sm:h-[62vh]' : 'h-[300px] sm:h-[380px]')}>
        {backdrop ? (
          <img src={backdrop} alt="" aria-hidden className="absolute inset-0 size-full object-cover object-top" draggable={false} />
        ) : (
          blurredPoster && (
            <img src={blurredPoster} alt="" aria-hidden className="absolute inset-0 size-full scale-125 object-cover blur-2xl saturate-125" draggable={false} />
          )
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/85 via-surface/20 to-transparent" />

        <div className={cn('absolute inset-x-0 z-10 flex items-center justify-between p-4 sm:p-5', variant === 'page' ? 'top-16 sm:top-[72px]' : 'top-0')}>
          {variant === 'page' ? (
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-black/40 pl-3 pr-4 text-sm font-medium text-white/85 backdrop-blur-md transition hover:bg-black/60 hover:text-white"
            >
              <ArrowLeft className="size-4" /> Back to Discover
            </Link>
          ) : (
            <span />
          )}
          {onClose && (
            <IconButton label="Close details" onClick={onClose} className="bg-black/40 hover:bg-black/60" autoFocus>
              <X />
            </IconButton>
          )}
        </div>
      </div>

      {/* ───── Content ───── */}
      <div className={cn('relative z-10 -mt-28 pb-10 sm:-mt-36', variant === 'page' ? 'page-gutter mx-auto max-w-7xl' : 'px-5 sm:px-8')}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
          <PosterImage
            movie={movie}
            size="w500"
            priority
            className="hidden w-[150px] shrink-0 rounded-2xl poster-shadow ring-1 ring-white/10 sm:block sm:w-[190px] lg:w-[220px] aspect-[2/3]"
            sizes="220px"
          />
          <div className="min-w-0 flex-1">
            {recommendation && (
              <div className="mb-3 flex items-center gap-2">
                <MatchBadge score={recommendation.matchScore} size="lg" />
                <span className="text-xs text-white/50">for how you feel right now</span>
              </div>
            )}
            <h1 className={cn('font-medium tracking-[-0.04em] text-white text-balance', variant === 'page' ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-3xl sm:text-4xl lg:text-[2.75rem]')}>
              {movie.title}
            </h1>
            {movie.tagline && <p className="mt-2 font-display text-lg italic text-white/55 sm:text-xl">“{movie.tagline}”</p>}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/65">
              <RatingBadge rating={movie.rating} voteCount={movie.voteCount} size="md" />
              <span className="rounded-md border border-white/25 px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-white/85" title="Content rating">
                {movie.contentRating}
              </span>
              <span>{movie.releaseYear}</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" /> {formatRuntime(movie.runtimeMinutes)}
              </span>
              <span>{formatLanguage(movie.language)}</span>
              <div className="flex flex-wrap gap-1.5">
                {movie.genres.map((genre) => (
                  <span key={genre} className="rounded-full border border-white/12 px-2.5 py-0.5 text-xs text-white/75">
                    {formatGenre(genre)}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Button size="lg" onClick={handleWatch} loading={launching} leadingIcon={<Play className="fill-current" />}>
                {primaryProvider ? `Watch now on ${primaryProvider.shortName}` : 'Watch now'}
              </Button>
              <IconButton label={saved ? 'Remove from My Movies' : 'Add to My Movies'} size="lg" variant="solid" active={saved} onClick={toggleSaved}>
                {saved ? <BookmarkCheck /> : <Bookmark />}
              </IconButton>
              <IconButton label="Like" size="lg" variant="solid" active={liked} onClick={like}>
                <ThumbsUp />
              </IconButton>
              <IconButton label="Dislike" size="lg" variant="solid" active={disliked} onClick={dislike}>
                <ThumbsDown />
              </IconButton>
              <IconButton label={watched ? 'Mark as not watched' : 'Mark as watched'} size="lg" variant="solid" active={watched} onClick={toggleWatched}>
                <Eye />
              </IconButton>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:gap-8">
          <div className="space-y-6">
            {recommendation && <RecommendationReason recommendation={recommendation} />}

            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Overview</h2>
              <p className="mt-3 text-[15px] leading-7 text-white/80 text-pretty">{movie.overview}</p>
            </section>

            <section className="grid gap-6 sm:grid-cols-[1fr_1.4fr]">
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Director</h2>
                <p className="mt-3 text-sm font-medium text-white">{movie.director}</p>
              </div>
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Cast</h2>
                <ul className="mt-3 space-y-2">
                  {movie.cast.map((member) => (
                    <li key={member.name} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium text-white">{member.name}</span>
                      <span className="truncate text-white/45">{member.character}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-white/8 bg-surface-2/60 p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Emotional profile</h2>
              <EmotionalProfile profile={movie.emotionalProfile} className="mt-4" />
            </section>

            <section className="rounded-3xl border border-white/8 bg-surface-2/60 p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Available on</h2>
              {providers.length > 0 ? (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {providers.map((id) => (
                      <StreamingProviderBadge key={id} providerId={id} variant="solid" size="md" />
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-white/45">
                    Streaming in {country.flag} {country.name}.{' '}
                    {preferences.streamingProviders.includes(providers[0]) ? 'Included with a service you already have.' : 'Not on your services yet.'}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-white/50">Not currently streaming in {country.name}.</p>
              )}
            </section>
          </div>
        </div>

        <FeedbackPanel movie={movie} recommendationId={recommendation ? response?.id : undefined} historyId={activeHistoryId} className="mt-8" />
      </div>
    </div>
  )
}

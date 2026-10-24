'use client'

import { useState } from 'react'
import type { Movie } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PosterImageProps {
  movie: Pick<Movie, 'title' | 'posterUrl' | 'releaseYear'>
  className?: string
  imgClassName?: string
  priority?: boolean
  sizes?: string
}

/**
 * Poster with a graceful fade-in and a designed fallback if the image is missing or fails.
 * Uses a plain <img>; the posters are served as-is from the catalogue bucket.
 */
export function PosterImage({ movie, className, imgClassName, priority = false, sizes }: PosterImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const src = movie.posterUrl

  return (
    <div className={cn('relative overflow-hidden bg-surface-2', className)}>
      {!failed && src ? (
        <img
          src={src}
          sizes={sizes ?? '(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 45vw'}
          alt={`${movie.title} poster`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn('size-full object-cover transition-opacity duration-700', loaded ? 'opacity-100' : 'opacity-0', imgClassName)}
          draggable={false}
        />
      ) : (
        <div className="flex size-full flex-col justify-end bg-gradient-to-b from-surface-3 to-ink p-4">
          <p className="text-sm font-semibold leading-tight text-white/80">{movie.title}</p>
          {movie.releaseYear && <p className="mt-1 text-xs text-white/40">{movie.releaseYear}</p>}
        </div>
      )}
      {!loaded && !failed && src && <div className="skeleton absolute inset-0" aria-hidden />}
    </div>
  )
}

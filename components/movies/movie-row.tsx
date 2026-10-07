'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Movie, Recommendation } from '@/lib/types'
import { MovieCard, MovieCardSkeleton, type MovieCardSize } from '@/components/movies/movie-card'
import { SectionHeading } from '@/components/shared/section-heading'
import { IconButton } from '@/components/shared/icon-button'
import { cn } from '@/lib/utils'

export interface MovieRowItem {
  movie: Movie
  recommendation?: Recommendation
}

interface MovieRowProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  items: MovieRowItem[]
  cardSize?: MovieCardSize
  className?: string
  loading?: boolean
}

export function MovieRow({ title, subtitle, items, cardSize = 'md', className, loading = false }: MovieRowProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const updateArrows = useCallback(() => {
    const node = scroller.current
    if (!node) return
    setCanLeft(node.scrollLeft > 8)
    setCanRight(node.scrollLeft + node.clientWidth < node.scrollWidth - 8)
  }, [])

  useEffect(() => {
    updateArrows()
    const node = scroller.current
    if (!node) return
    const observer = new ResizeObserver(updateArrows)
    observer.observe(node)
    node.addEventListener('scroll', updateArrows, { passive: true })
    return () => {
      observer.disconnect()
      node.removeEventListener('scroll', updateArrows)
    }
  }, [updateArrows, items.length])

  const scrollBy = (direction: 1 | -1) => {
    const node = scroller.current
    if (!node) return
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: 'smooth' })
  }

  if (!loading && items.length === 0) return null

  return (
    <section className={cn('relative', className)}>
      <SectionHeading
        title={title}
        subtitle={subtitle}
        className="page-gutter mb-4"
        action={
          <div className="hidden items-center gap-2 md:flex">
            <IconButton label="Scroll left" size="sm" variant="solid" onClick={() => scrollBy(-1)} disabled={!canLeft}>
              <ChevronLeft />
            </IconButton>
            <IconButton label="Scroll right" size="sm" variant="solid" onClick={() => scrollBy(1)} disabled={!canRight}>
              <ChevronRight />
            </IconButton>
          </div>
        }
      />
      <div
        ref={scroller}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth page-gutter pb-4 pt-2 sm:gap-4 [scroll-padding-inline:1.25rem] sm:[scroll-padding-inline:2rem] lg:[scroll-padding-inline:3rem]"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <MovieCardSkeleton key={index} size={cardSize} />)
          : items.map((item, index) => (
              <MovieCard key={item.movie.id} movie={item.movie} recommendation={item.recommendation} size={cardSize} index={index} />
            ))}
        <div className="w-px shrink-0" aria-hidden />
      </div>
    </section>
  )
}

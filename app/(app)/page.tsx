'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useDiscovery } from '@/lib/store/discovery-context'
import { HeroSection } from '@/components/discover/hero-section'
import { IdleShowcase } from '@/components/discover/idle-showcase'
import { LoadingRecommendations } from '@/components/discover/loading-recommendations'
import { MovieCatalog } from '@/components/movies/movie-catalog'
import { Button } from '@/components/shared/button'

export default function DiscoverPage() {
  const { status, response, error, findMovies } = useDiscovery()

  return (
    <div className="mx-auto max-w-[1600px]">
      <HeroSection />
      {status === 'idle' && <IdleShowcase />}
      {status === 'loading' && <LoadingRecommendations />}
      {status === 'success' && response && <MovieCatalog key={response.id} response={response} />}
      {status === 'error' && (
        <div className="page-gutter pb-24">
          <div role="alert" className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-3xl border border-destructive/20 bg-destructive/8 p-8 text-center animate-fade-up">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
              <AlertTriangle className="size-6" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">We couldn’t find your movie</h2>
              <p className="mt-1 text-sm text-white/55">{error}</p>
            </div>
            <Button variant="secondary" onClick={findMovies} leadingIcon={<RotateCcw />}>
              Try again
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

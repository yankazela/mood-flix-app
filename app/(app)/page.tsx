'use client'

import { useTranslation } from 'react-i18next'
import { AlertTriangle, Heart, RotateCcw, Sparkles } from 'lucide-react'
import { useDiscovery } from '@/lib/store/discovery-context'
import { useBilling } from '@/lib/store/billing-context'
import { formatResetsIn } from '@/lib/billing/format'
import { HeroSection } from '@/components/discover/hero-section'
import { IdleShowcase } from '@/components/discover/idle-showcase'
import { LoadingRecommendations } from '@/components/discover/loading-recommendations'
import { SavedMovies } from '@/components/discover/saved-movies'
import { MovieCatalog } from '@/components/movies/movie-catalog'
import { Button } from '@/components/shared/button'

const ERROR_COPY = {
  safety: { title: 'discover.errors.safety', tone: 'care' },
  'rate-limit': { title: 'discover.errors.rateLimit', tone: 'notice' },
  unavailable: { title: 'discover.errors.unavailable', tone: 'notice' },
  invalid: { title: 'discover.errors.invalid', tone: 'notice' },
  generic: { title: 'discover.errors.generic', tone: 'error' },
} as const

export default function DiscoverPage() {
  const { t } = useTranslation()
  const { status, response, error, errorKind, findMovies } = useDiscovery()
  const { plan, usage, openPaywall } = useBilling()
  const limited = errorKind === 'rate-limit'
  const copy = limited && plan === 'free' ? { title: 'discover.errors.rateLimitFree', tone: 'notice' as const } : ERROR_COPY[errorKind ?? 'generic']
  // A supportive message or a daily limit is not something a retry fixes.
  const retryable = errorKind !== 'safety' && !limited

  return (
    <div className="mx-auto max-w-[1600px]">
      <HeroSection />
      <SavedMovies />
      {status === 'idle' && <IdleShowcase />}
      {status === 'loading' && <LoadingRecommendations />}
      {status === 'success' && response && <MovieCatalog key={response.id} response={response} />}
      {status === 'error' && (
        <div className="page-gutter pb-24">
          <div role="alert" className={`mx-auto flex max-w-lg flex-col items-center gap-4 rounded-3xl border p-8 text-center animate-fade-up ${copy.tone === 'error' ? 'border-destructive/20 bg-destructive/8' : 'border-brand/20 bg-brand/8'}`}>
            <span className={`flex size-12 items-center justify-center rounded-2xl ${copy.tone === 'error' ? 'bg-destructive/15 text-destructive' : 'bg-brand/15 text-brand'}`}>
              {copy.tone === 'error' ? <AlertTriangle className="size-6" /> : limited ? <Sparkles className="size-6" /> : <Heart className="size-6" />}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">{t(copy.title)}</h2>
              <p className="mt-1 text-sm leading-6 text-white/65 text-pretty">{error}</p>
            </div>
            {retryable && (
              <Button variant="secondary" onClick={findMovies} leadingIcon={<RotateCcw />}>
                {t('common.tryAgain')}
              </Button>
            )}
            {limited && plan === 'free' && (
              <Button onClick={openPaywall} leadingIcon={<Sparkles />}>
                {t('discover.errors.upgrade')}
              </Button>
            )}
            {limited && usage && <p className="text-xs text-white/45">{t('discover.errors.resets', { when: formatResetsIn(usage.resetsAt) })}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

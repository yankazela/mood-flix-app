'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Clapperboard, Shield, Tv } from 'lucide-react'
import { STREAMING_PROVIDERS } from '@/lib/data/providers'
import { GENRE_OPTIONS } from '@/lib/data/genres'
import { CONTENT_RATINGS, getContentRating } from '@/lib/data/content-ratings'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateUserRequested, updateUserReset } from '@/store/auth/slice'
import { useAuth } from '@/lib/store/auth-context'
import { usePreferences } from '@/lib/store/preferences-context'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/shared/button'
import { ProviderCard } from '@/components/onboarding/provider-card'
import { CountrySelect } from '@/components/onboarding/country-select'
import { GenreCard } from '@/components/onboarding/genre-card'
import { ContentRatingSelect } from '@/components/onboarding/content-rating-select'
import { StepIndicator, type OnboardingStepMeta } from '@/components/onboarding/step-indicator'

const STEPS: OnboardingStepMeta[] = [
  { id: 'services', label: 'Services' },
  { id: 'genres', label: 'Genres' },
  { id: 'rating', label: 'Rating' },
]

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <Onboarding />
    </Suspense>
  )
}

function Onboarding() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { updateStatus, updateError } = useAppSelector((state) => state.auth)
  const saving = updateStatus === 'pending'
  const [submitted, setSubmitted] = useState(false)
  const searchParams = useSearchParams()
  const editing = searchParams.get('edit') === '1'
  const { user } = useAuth()
  const { preferences, toggleStreamingProvider, setCountry, toggleFavouriteGenre, setMaxContentRating, completeOnboarding } = usePreferences()
  const [step, setStep] = useState(0)
  const firstName = user?.fullName.split(' ')[0]

  const available = STREAMING_PROVIDERS.filter((provider) => provider.countries.includes(preferences.country))
  const unavailable = STREAMING_PROVIDERS.filter((provider) => !provider.countries.includes(preferences.country))
  const serviceCount = preferences.streamingProviders.length
  const genreCount = preferences.favouriteGenres.length
  const rating = getContentRating(preferences.maxContentRating)
  const isLast = step === STEPS.length - 1

  useEffect(() => {
    dispatch(updateUserReset())
  }, [dispatch])

  useEffect(() => {
    if (!submitted || updateStatus !== 'succeeded') return
    completeOnboarding()
    dispatch(updateUserReset())
    router.replace('/')
  }, [submitted, updateStatus, completeOnboarding, dispatch, router])

  const finish = () => {
    if (saving || !user) return
    setSubmitted(true)
    dispatch(updateUserRequested({
      fullName: user.fullName,
      country: preferences.country,
      services: preferences.streamingProviders,
      ratingsAllowed: CONTENT_RATINGS.filter((option) => option.rank <= rating.rank).map((option) => option.id),
      genrePrefs: Object.fromEntries(preferences.favouriteGenres.map((genre) => [genre, 1])),
    }))
    console.log('Finishing onboarding with preferences:', preferences)  
  }
  const next = () => (isLast ? finish() : setStep((s) => Math.min(s + 1, STEPS.length - 1)))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const current = STEPS[step].id

  return (
    <div className="relative min-h-dvh overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px]" aria-hidden>
        <div className="absolute left-1/2 top-[-260px] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand/10 blur-[150px]" />
        <div className="absolute right-[-100px] top-[40px] h-[380px] w-[480px] rounded-full bg-[#5b4bff]/14 blur-[140px]" />
      </div>

      <header className="relative z-10 page-gutter mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 sm:h-[72px]">
        <Logo href={editing ? '/' : ''} />
        <StepIndicator steps={STEPS} current={step} onSelect={editing && !saving ? setStep : undefined} />
        {/* {!editing ? (
          <button type="button" onClick={finish} disabled={saving} className="text-sm text-white/45 transition hover:text-white disabled:opacity-50">
            Skip for now
          </button>
        ) : ( */}
          <span className="hidden w-[88px] sm:block" aria-hidden />
      </header>

      <main inert={saving} className="relative z-10 page-gutter mx-auto max-w-5xl pb-40 pt-6 sm:pt-12">
        {updateError && <p role="alert" className="mb-6 text-sm text-destructive">{updateError}</p>}
        {current === 'services' && (
          <section key="services">
            <StepHeading
              icon={<Tv className="size-3.5" />}
              eyebrow={editing ? 'Your streaming services' : `Step 1 of 3 · ${firstName ? `Hi ${firstName}` : 'Welcome'}`}
              title={
                <>
                  Where do you <span className="font-display italic text-brand">watch?</span>
                </>
              }
              body="Pick the services you already pay for and we’ll only recommend movies you can press play on tonight. Availability depends on your region."
            />
            <div className="mt-8 max-w-sm animate-fade-up stagger" style={{ '--stagger-index': 1 } as React.CSSProperties}>
              <CountrySelect value={preferences.country} onChange={setCountry} />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {available.map((provider, index) => (
                <ProviderCard key={provider.id} provider={provider} index={index + 2} selected={preferences.streamingProviders.includes(provider.id)} onToggle={() => toggleStreamingProvider(provider.id)} />
              ))}
              {unavailable.map((provider, index) => (
                <div key={provider.id} className="opacity-40 grayscale">
                  <ProviderCard provider={provider} index={available.length + index + 2} selected={false} onToggle={() => undefined} unavailable />
                </div>
              ))}
            </div>
          </section>
        )}

        {current === 'genres' && (
          <section key="genres">
            <StepHeading
              icon={<Clapperboard className="size-3.5" />}
              eyebrow={editing ? 'Your favourite genres' : 'Step 2 of 3 · Your taste'}
              title={
                <>
                  What do you usually <span className="font-display italic text-brand">love?</span>
                </>
              }
              body="Pick a few genres you keep coming back to. Your mood still leads every search; this just helps us break ties in your favour."
            />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {GENRE_OPTIONS.map((genre, index) => (
                <GenreCard key={genre.id} genre={genre} index={index + 1} selected={preferences.favouriteGenres.includes(genre.id)} onToggle={() => toggleFavouriteGenre(genre.id)} />
              ))}
            </div>
          </section>
        )}

        {current === 'rating' && (
          <section key="rating">
            <StepHeading
              icon={<Shield className="size-3.5" />}
              eyebrow={editing ? 'Your content rating' : 'Step 3 of 3 · Comfort level'}
              title={
                <>
                  How far should we <span className="font-display italic text-brand">go?</span>
                </>
              }
              body="Choose the most mature rating you’re comfortable with. Great for shared accounts, family TVs, or just knowing what you’re in for."
            />
            <div className="mt-8 max-w-3xl">
              <ContentRatingSelect value={preferences.maxContentRating} onChange={setMaxContentRating} />
            </div>
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/8 bg-ink/85 backdrop-blur-xl safe-bottom">
        <div className="page-gutter mx-auto flex max-w-5xl items-center justify-between gap-4 py-3">
          <p className="min-w-0 text-sm text-white/55">
            {current === 'services' &&
              (serviceCount === 0 ? 'Select at least one service for the best results.' : <><span className="font-semibold text-white">{serviceCount}</span> service{serviceCount === 1 ? '' : 's'} selected</>)}
            {current === 'genres' &&
              (genreCount === 0 ? 'Pick 3 or more for the sharpest picks.' : <><span className="font-semibold text-white">{genreCount}</span> genre{genreCount === 1 ? '' : 's'} selected</>)}
            {current === 'rating' && (
              <>
                Up to <span className="font-semibold text-white">{rating.id}</span> · {rating.title}
              </>
            )}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {step > 0 && (
              <Button variant="ghost" size="lg" onClick={back} disabled={saving} leadingIcon={<ArrowLeft />}>
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            <Button size="lg" onClick={next} loading={saving} disabled={saving} trailingIcon={isLast ? <Check /> : <ArrowRight />}>
              {isLast ? (editing ? 'Save changes' : 'Finish') : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepHeading({ icon, eyebrow, title, body }: { icon: React.ReactNode; eyebrow: string; title: React.ReactNode; body: string }) {
  return (
    <div className="max-w-2xl animate-fade-up">
      <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
        {icon} {eyebrow}
      </p>
      <h1 className="text-4xl font-medium leading-[1.05] tracking-[-0.05em] text-white text-balance sm:text-5xl lg:text-6xl">{title}</h1>
      <p className="mt-4 max-w-lg text-base leading-7 text-white/50">{body}</p>
    </div>
  )
}

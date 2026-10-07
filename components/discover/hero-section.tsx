'use client'

import { useDiscovery } from '@/lib/store/discovery-context'
import { usePreferences } from '@/lib/store/preferences-context'
import { getCountry } from '@/lib/data/countries'
import { getProvider } from '@/lib/data/providers'
import { PromptInput } from '@/components/discover/prompt-input'
import { MoodSelector } from '@/components/discover/mood-selector'
import { FiltersPanel } from '@/components/discover/filters-panel'
import { cn } from '@/lib/utils'

export function HeroSection() {
  const { prompt, moods, filters, status, setPrompt, toggleMood, setFilters, resetFilters, findMovies, activeFilterCount } = useDiscovery()
  const { preferences } = usePreferences()
  const loading = status === 'loading'
  const canSubmit = prompt.trim().length > 0 || moods.length > 0
  const compact = status === 'success' || status === 'loading'
  const country = getCountry(preferences.country)
  const services = preferences.streamingProviders.map((id) => getProvider(id).shortName)

  return (
    <section className={cn('relative page-gutter transition-all duration-700', compact ? 'pb-8 pt-8 sm:pt-10' : 'pb-14 pt-10 sm:pb-20 sm:pt-16 lg:pt-24')}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-[-240px] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand/10 blur-[140px] animate-glow" />
        <div className="absolute right-[-120px] top-[60px] h-[420px] w-[520px] rounded-full bg-[#5b4bff]/14 blur-[140px]" />
        <div className="absolute left-[-160px] top-[160px] h-[360px] w-[460px] rounded-full bg-[#ff4d7d]/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-4xl">
        <div className={cn('transition-all duration-700 ease-out-expo', compact ? 'mb-6' : 'mb-9 sm:mb-12')}>
          <h1
            className={cn(
              'font-medium tracking-[-0.055em] text-white text-balance transition-all duration-700 ease-out-expo animate-fade-up',
              compact ? 'text-3xl sm:text-4xl' : 'text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl',
            )}
          >
            What do you feel like <span className="font-display italic text-brand">watching?</span>
          </h1>
          <p
            className={cn(
              'mt-4 max-w-xl text-white/50 text-pretty animate-fade-up stagger transition-all duration-700',
              compact ? 'text-sm' : 'text-base leading-7 sm:text-lg',
            )}
            style={{ '--stagger-index': 1 } as React.CSSProperties}
          >
            Tell us how you feel. We’ll find the perfect movie for this moment.
          </p>
        </div>

        <div className="animate-fade-up stagger" style={{ '--stagger-index': 2 } as React.CSSProperties}>
          <PromptInput value={prompt} onChange={setPrompt} onSubmit={findMovies} loading={loading} canSubmit={canSubmit}>
            <FiltersPanel filters={filters} onChange={setFilters} onReset={resetFilters} activeCount={activeFilterCount} disabled={loading} />
            <span className="hidden truncate sm:inline">
              {services.length > 0 ? `${services.slice(0, 3).join(', ')}${services.length > 3 ? ` +${services.length - 3}` : ''}` : 'All services'} · {country.flag} {country.name}
            </span>
          </PromptInput>
        </div>

        <MoodSelector selected={moods} onToggle={toggleMood} disabled={loading} className="mt-5" />
      </div>
    </section>
  )
}

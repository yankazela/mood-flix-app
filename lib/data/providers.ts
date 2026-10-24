import type { ServiceRef, StreamingProvider, StreamingProviderId } from '@/lib/types'

/**
 * The services the app lets people pick. `slugs` are the catalogue's provider slugs for each one
 * (the backend expands these ids the same way); `searchUrl` opens the service's own search.
 */
export const STREAMING_PROVIDERS: StreamingProvider[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    shortName: 'Netflix',
    brandColor: '#E50914',
    textColor: '#FFFFFF',
    countries: ['CA', 'US', 'GB', 'FR', 'DE', 'AU', 'ZA', 'IN', 'BR'],
    slugs: ['netflix', 'netflix-standard-with-ads', 'netflix-basic-with-ads'],
    searchUrl: 'https://www.netflix.com/search?q={title}',
  },
  {
    id: 'prime',
    name: 'Prime Video',
    shortName: 'Prime',
    brandColor: '#00A8E1',
    textColor: '#0F171E',
    countries: ['CA', 'US', 'GB', 'FR', 'DE', 'AU', 'ZA', 'IN', 'BR'],
    slugs: ['amazon-prime-video', 'amazon-prime-video-with-ads', 'prime-video'],
    searchUrl: 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase={title}',
  },
  {
    id: 'disney',
    name: 'Disney+',
    shortName: 'Disney+',
    brandColor: '#113CCF',
    textColor: '#FFFFFF',
    countries: ['CA', 'US', 'GB', 'FR', 'DE', 'AU', 'ZA', 'IN', 'BR'],
    slugs: ['disney-plus', 'disney'],
    searchUrl: 'https://www.disneyplus.com/search/{title}',
  },
  {
    id: 'apple',
    name: 'Apple TV+',
    shortName: 'Apple TV+',
    brandColor: '#F5F5F7',
    textColor: '#0B0B0C',
    countries: ['CA', 'US', 'GB', 'FR', 'DE', 'AU', 'ZA', 'IN', 'BR'],
    slugs: ['apple-tv-plus', 'apple-tv', 'apple-tv-channel'],
    searchUrl: 'https://tv.apple.com/search?term={title}',
  },
  {
    id: 'paramount',
    name: 'Paramount+',
    shortName: 'Paramount+',
    brandColor: '#0064FF',
    textColor: '#FFFFFF',
    countries: ['CA', 'US', 'GB', 'FR', 'DE', 'AU', 'BR'],
    slugs: ['paramount-plus', 'paramount', 'paramount-plus-apple-tv-channel'],
    searchUrl: 'https://www.paramountplus.com/search/?q={title}',
  },
  {
    id: 'crave',
    name: 'Crave',
    shortName: 'Crave',
    brandColor: '#1BC7B6',
    textColor: '#061B19',
    countries: ['CA'],
    slugs: ['crave', 'crave-starz'],
    searchUrl: 'https://www.crave.ca/en/search?q={title}',
  },
  {
    id: 'max',
    name: 'Max',
    shortName: 'Max',
    brandColor: '#002BE7',
    textColor: '#FFFFFF',
    countries: ['US', 'FR', 'AU', 'BR'],
    slugs: ['max', 'hbo-max'],
    searchUrl: 'https://www.max.com/search?q={title}',
  },
]

export const PROVIDER_MAP: Record<StreamingProviderId, StreamingProvider> = Object.fromEntries(
  STREAMING_PROVIDERS.map((provider) => [provider.id, provider]),
) as Record<StreamingProviderId, StreamingProvider>

export function getProvider(id: StreamingProviderId): StreamingProvider {
  return PROVIDER_MAP[id]
}

export function isProviderId(value: string): value is StreamingProviderId {
  return value in PROVIDER_MAP
}

/** The app's provider for a catalogue slug, or for an app id that was stored instead. */
export function providerForSlug(slug: string): StreamingProvider | undefined {
  return STREAMING_PROVIDERS.find((provider) => provider.id === slug || provider.slugs.includes(slug))
}

function prettifySlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Builds a service reference for a catalogue slug and the title being looked up on it. */
export function serviceForSlug(slug: string, title: string): ServiceRef {
  const provider = providerForSlug(slug)
  if (!provider) return { slug, name: prettifySlug(slug) }
  return { slug, name: provider.name, providerId: provider.id, url: provider.searchUrl.replace('{title}', encodeURIComponent(title)) }
}

/**
 * Services the title is on, the user's own first. Each app service appears once however many of
 * its catalogue slugs (e.g. "netflix" and "netflix-standard-with-ads") the title carries.
 */
export function orderServices(services: ServiceRef[], preferred: StreamingProviderId[] = []): ServiceRef[] {
  const seen = new Set<string>()
  const unique = services.filter((service) => {
    const key = service.providerId ?? service.slug
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  const mine = (service: ServiceRef) => (service.providerId && preferred.includes(service.providerId) ? 0 : 1)
  return [...unique].sort((a, b) => mine(a) - mine(b))
}

export function isOnMyServices(services: ServiceRef[], preferred: StreamingProviderId[]): boolean {
  return services.some((service) => service.providerId && preferred.includes(service.providerId))
}

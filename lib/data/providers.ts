import type { StreamingProvider, StreamingProviderId } from '@/lib/types'

export const STREAMING_PROVIDERS: StreamingProvider[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    shortName: 'Netflix',
    brandColor: '#E50914',
    textColor: '#FFFFFF',
    countries: ['CA', 'US', 'GB', 'FR', 'DE', 'AU', 'ZA', 'IN', 'BR'],
  },
  {
    id: 'prime',
    name: 'Prime Video',
    shortName: 'Prime',
    brandColor: '#00A8E1',
    textColor: '#0F171E',
    countries: ['CA', 'US', 'GB', 'FR', 'DE', 'AU', 'ZA', 'IN', 'BR'],
  },
  {
    id: 'disney',
    name: 'Disney+',
    shortName: 'Disney+',
    brandColor: '#113CCF',
    textColor: '#FFFFFF',
    countries: ['CA', 'US', 'GB', 'FR', 'DE', 'AU', 'ZA', 'IN', 'BR'],
  },
  {
    id: 'apple',
    name: 'Apple TV+',
    shortName: 'Apple TV+',
    brandColor: '#F5F5F7',
    textColor: '#0B0B0C',
    countries: ['CA', 'US', 'GB', 'FR', 'DE', 'AU', 'ZA', 'IN', 'BR'],
  },
  {
    id: 'paramount',
    name: 'Paramount+',
    shortName: 'Paramount+',
    brandColor: '#0064FF',
    textColor: '#FFFFFF',
    countries: ['CA', 'US', 'GB', 'FR', 'DE', 'AU', 'BR'],
  },
  {
    id: 'crave',
    name: 'Crave',
    shortName: 'Crave',
    brandColor: '#1BC7B6',
    textColor: '#061B19',
    countries: ['CA'],
  },
  {
    id: 'max',
    name: 'Max',
    shortName: 'Max',
    brandColor: '#002BE7',
    textColor: '#FFFFFF',
    countries: ['US', 'FR', 'AU', 'BR'],
  },
]

export const PROVIDER_MAP: Record<StreamingProviderId, StreamingProvider> = Object.fromEntries(
  STREAMING_PROVIDERS.map((provider) => [provider.id, provider]),
) as Record<StreamingProviderId, StreamingProvider>

export function getProvider(id: StreamingProviderId): StreamingProvider {
  return PROVIDER_MAP[id]
}

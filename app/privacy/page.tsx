'use client'

import { LegalPage } from '@/components/legal/legal-page'
import { PRIVACY } from '@/lib/legal/privacy'

/** Public, no account needed: Apple and Google link to it from the store listings. */
export default function PrivacyPage() {
  return <LegalPage documents={PRIVACY} other={{ href: '/terms', labelKey: 'legal.terms' }} />
}

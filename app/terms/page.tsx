'use client'

import { LegalPage } from '@/components/legal/legal-page'
import { TERMS } from '@/lib/legal/terms'

/** Public, no account needed. */
export default function TermsPage() {
  return <LegalPage documents={TERMS} other={{ href: '/privacy', labelKey: 'legal.privacy' }} />
}

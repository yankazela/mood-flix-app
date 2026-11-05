'use client'

import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { LegalDocument } from '@/lib/legal/types'
import { LEGAL_CONTACT_EMAIL, LEGAL_JURISDICTION, LEGAL_OPERATOR, LEGAL_UPDATED } from '@/lib/legal/config'
import { countryName } from '@/lib/data/countries'
import { regionalTag, type Locale } from '@/lib/i18n'
import { useLocale } from '@/lib/i18n/language-context'
import { Logo } from '@/components/shared/logo'
import { LanguageSwitcher } from '@/components/shared/language-switcher'

interface LegalPageProps {
  documents: Record<Locale, LegalDocument>
  /** The other legal page, linked at the bottom. */
  other: { href: string; labelKey: string }
}

/** A public, readable page for the Terms or the Privacy Policy, in the interface language. */
export function LegalPage({ documents, other }: LegalPageProps) {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const doc = documents[locale] ?? documents.en
  const updated = new Date(`${LEGAL_UPDATED}T00:00:00Z`).toLocaleDateString(regionalTag(), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  const jurisdiction = LEGAL_JURISDICTION ? countryName(LEGAL_JURISDICTION) : t('legal.jurisdictionFallback', { operator: LEGAL_OPERATOR })

  // {contact} becomes a mailto link; the other tokens are plain text.
  const render = (text: string): ReactNode =>
    text.split(/(\{(?:operator|contact|updated|jurisdiction)\})/).map((part, index) => {
      if (part === '{operator}') return <Fragment key={index}>{LEGAL_OPERATOR}</Fragment>
      if (part === '{updated}') return <Fragment key={index}>{updated}</Fragment>
      if (part === '{jurisdiction}') return <Fragment key={index}>{jurisdiction}</Fragment>
      if (part === '{contact}') {
        return LEGAL_CONTACT_EMAIL ? (
          <a key={index} href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-brand underline-offset-4 hover:underline">
            {LEGAL_CONTACT_EMAIL}
          </a>
        ) : (
          <Fragment key={index}>{t('legal.contactFallback')}</Fragment>
        )
      }
      return <Fragment key={index}>{part}</Fragment>
    })

  const goBack = () => {
    if (window.history.length > 1) window.history.back()
    else window.location.assign('/')
  }

  return (
    <div className="min-h-dvh bg-ink text-white">
      <header className="page-gutter mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 sm:h-[72px]">
        <Logo />
        <LanguageSwitcher />
      </header>

      <main className="page-gutter mx-auto max-w-3xl pb-24 pt-6 safe-bottom sm:pt-10">
        <button type="button" onClick={goBack} className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/50 transition hover:text-white">
          <ArrowLeft className="size-4" /> {t('legal.back')}
        </button>

        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">{t('legal.legal')}</p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-balance sm:text-5xl">{doc.title}</h1>
        <p className="mt-3 text-sm text-white/45">{t('legal.updated', { date: updated })}</p>
        <p className="mt-8 text-[15px] leading-7 text-white/75 text-pretty">{render(doc.intro)}</p>

        <div className="mt-10 space-y-10">
          {doc.sections.map((section, index) => (
            <section key={section.heading} aria-labelledby={`legal-section-${index}`}>
              <h2 id={`legal-section-${index}`} className="text-lg font-semibold tracking-tight">
                {index + 1}. {section.heading}
              </h2>
              {section.paragraphs?.map((paragraph, p) => (
                <p key={p} className="mt-3 text-[15px] leading-7 text-white/70 text-pretty">
                  {render(paragraph)}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-7 text-white/70 marker:text-brand/70">
                  {section.bullets.map((bullet, b) => (
                    <li key={b} className="text-pretty">
                      {render(bullet)}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <p className="mt-14 border-t border-white/8 pt-6 text-sm">
          <Link href={other.href} className="text-white/70 underline-offset-4 hover:text-brand hover:underline">
            {t(other.labelKey)}
          </Link>
        </p>
      </main>
    </div>
  )
}

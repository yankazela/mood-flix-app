'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import { PosterWall } from '@/components/auth/poster-wall'
import { Logo } from '@/components/shared/logo'
import { LanguageSwitcher } from '@/components/shared/language-switcher'

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="relative min-h-dvh overflow-hidden bg-ink">
      <PosterWall />
      <LanguageSwitcher className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6" />
      <div className="relative z-10 mx-auto grid min-h-dvh max-w-[1400px] lg:grid-cols-[1.1fr_1fr]">
        <aside className="hidden flex-col justify-between p-12 lg:flex xl:p-16">
          <Logo size="lg" href="" />
          <div className="max-w-lg animate-fade-up">
            <p className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
              <Sparkles className="size-3.5" /> {t('auth.tagline')}
            </p>
            <h2 className="text-5xl font-medium leading-[1.02] tracking-[-0.05em] text-white text-balance xl:text-6xl">
              {t('auth.hero.line1')}
              <br />
              <Trans i18nKey="auth.hero.line2" components={{ em: <span className="font-display italic text-brand" /> }} />
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-white/55">{t('auth.hero.body')}</p>
          </div>
          <p className="text-xs text-white/35">
            {t('auth.hero.footer', { year: new Date().getFullYear() })}{' '}
            <Link href="/terms" className="underline-offset-4 hover:text-white hover:underline">{t('legal.terms')}</Link>
            {' · '}
            <Link href="/privacy" className="underline-offset-4 hover:text-white hover:underline">{t('legal.privacy')}</Link>
          </p>
        </aside>
        <main className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">{children}</main>
      </div>
    </div>
  )
}

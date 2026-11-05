'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/shared/logo'
import { buttonStyles } from '@/components/shared/button-styles'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-ink px-6 text-center">
      <Logo size="lg" href="" />
      <div>
        <p className="font-display text-7xl italic text-brand">404</p>
        <h1 className="mt-2 text-2xl font-medium text-white">{t('notFound.title')}</h1>
        <p className="mt-2 text-sm text-white/50">{t('notFound.body')}</p>
      </div>
      <Link href="/" className={buttonStyles({ size: 'lg' })}>
        {t('common.backToDiscover')}
      </Link>
    </div>
  )
}

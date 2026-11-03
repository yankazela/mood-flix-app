'use client'

import { Check, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LOCALES } from '@/lib/i18n'
import { useLocale } from '@/lib/i18n/language-context'
import { cn } from '@/lib/utils'

/** Compact select for headers and the auth pages. Language names stay in their own language. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()
  return (
    <label className={cn('relative inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/4 pl-3 pr-2.5 text-xs font-medium text-white/70 transition hover:border-white/20 hover:text-white focus-within:ring-2 focus-within:ring-brand/70', className)}>
      <Languages className="size-3.5" aria-hidden />
      <span className="uppercase">{locale}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
        aria-label={t('common.language')}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code} className="bg-surface-2 text-white">
            {t(`common.languages.${code}`)}
          </option>
        ))}
      </select>
    </label>
  )
}

/** Three buttons, for the user menu. */
export function LanguageOptions() {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()
  return (
    <div role="radiogroup" aria-label={t('common.language')} className="grid grid-cols-3 gap-1.5">
      {LOCALES.map((code) => {
        const active = code === locale
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLocale(code)}
            className={cn(
              'inline-flex h-8 items-center justify-center gap-1 rounded-lg border text-xs font-medium transition',
              active ? 'border-brand/60 bg-brand/15 text-brand' : 'border-white/10 bg-white/4 text-white/70 hover:border-white/20 hover:text-white',
            )}
          >
            {active && <Check className="size-3" strokeWidth={3} aria-hidden />}
            {t(`common.languages.${code}`)}
          </button>
        )
      })}
    </div>
  )
}

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/lib/i18n/messages/en.json'
import fr from '@/lib/i18n/messages/fr.json'
import es from '@/lib/i18n/messages/es.json'

/**
 * Interface language. The site is a static export that also runs inside Capacitor, so the locale
 * lives on the client (no /fr/ URLs): detected from the device on first run, then whatever the
 * person picks, kept in localStorage. Pages prerender in DEFAULT_LOCALE and switch after mount,
 * which keeps the server and client HTML identical.
 */

export const LOCALES = ['en', 'fr', 'es'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

const STORAGE_KEY = 'moodflix.locale'

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, fr: { translation: fr }, es: { translation: es } },
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...LOCALES],
    interpolation: { escapeValue: false },
    returnNull: false,
    react: { useSuspense: false },
    showSupportNotice: false,
  })
} else if (i18n.language !== DEFAULT_LOCALE) {
  // The instance outlives a module re-run (Fast Refresh, or a dev server keeping its process). Without this, a
  // changed DEFAULT_LOCALE would apply on one side only and the first render would not match the server's HTML.
  i18n.options.fallbackLng = DEFAULT_LOCALE
  void i18n.changeLanguage(DEFAULT_LOCALE)
}

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value) && (LOCALES as readonly string[]).includes(value as string)
}

/** The interface language right now. */
export function currentLocale(): Locale {
  const language = i18n.resolvedLanguage ?? i18n.language
  return isLocale(language) ? language : DEFAULT_LOCALE
}

/** The saved choice, else the first device language we support, else DEFAULT_LOCALE. Client-only. */
export function detectLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (isLocale(saved)) return saved
  } catch {
    // storage blocked: fall through to the device language
  }
  if (typeof navigator !== 'undefined') {
    for (const tag of navigator.languages ?? [navigator.language]) {
      const base = tag?.split('-')[0]?.toLowerCase()
      if (isLocale(base)) return base
    }
  }
  return DEFAULT_LOCALE
}

export function saveLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // storage blocked: the choice lasts for this session only
  }
}

/** A BCP 47 tag for speech recognition and date formatting: the device's own regional variant when it speaks this language. */
export function regionalTag(locale: Locale = currentLocale()): string {
  if (typeof navigator !== 'undefined') {
    const device = (navigator.languages ?? [navigator.language]).find((tag) => tag?.toLowerCase().startsWith(`${locale}-`))
    if (device) return device
  }
  return { en: 'en-US', fr: 'fr-FR', es: 'es-ES' }[locale]
}

/** Translate outside React: services, sagas and formatters. */
export const t = i18n.t.bind(i18n)

export default i18n

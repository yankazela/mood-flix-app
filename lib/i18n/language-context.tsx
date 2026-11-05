'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import i18n, { detectLocale, saveLocale, type Locale } from '@/lib/i18n'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

/**
 * Owns the interface language. The language is only known on the client (saved choice or device
 * language), so nothing below this provider renders until it is resolved: the server and the first
 * client render both produce the same empty shell, and the app then renders once in the right
 * language. Switching languages in an effect while parts of the tree were still waiting to hydrate
 * (any Suspense boundary) made those parts render in a different language than the server HTML.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale | null>(null)

  useEffect(() => {
    const detected = detectLocale()
    let cancelled = false
    void i18n.changeLanguage(detected).then(() => {
      if (!cancelled) setLocaleState(detected)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (locale) document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    saveLocale(next)
    void i18n.changeLanguage(next).then(() => setLocaleState(next))
  }, [])

  const value = useMemo(() => (locale ? { locale, setLocale } : null), [locale, setLocale])

  // Same markup on the server and on the first client render; the body's background keeps it from flashing.
  if (!value) return <div className="min-h-dvh bg-ink" aria-busy="true" />

  // No remount on change: components re-render through useTranslation, so app state survives a language switch.
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLocale(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLocale must be used within <LanguageProvider>')
  return context
}

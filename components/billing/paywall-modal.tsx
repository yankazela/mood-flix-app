'use client'

import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { Check, RotateCcw, Sparkles, X } from 'lucide-react'
import { ADVANCED_PRICE_LABEL, PLAN_LIMITS, PRIVACY_URL, TERMS_URL } from '@/lib/billing/config'
import { formatPlanDate, periodName } from '@/lib/billing/format'
import { useBilling } from '@/lib/store/billing-context'
import { useScrollLock } from '@/lib/hooks/use-scroll-lock'
import { Button } from '@/components/shared/button'
import { useToast } from '@/components/shared/toast'
import { cn } from '@/lib/utils'


/**
 * The upgrade sheet. On iPhone and Android it sells through the store; on the web it explains
 * where to subscribe. Apple reviews paywalls for the price, the renewal terms, a way to restore
 * purchases and links to the terms and privacy policy, so all of those live here.
 */
export function PaywallModal() {
  const billing = useBilling()
  const { paywallOpen, closePaywall } = billing
  const toast = useToast()
  const { t } = useTranslation()
  useScrollLock(paywallOpen)

  useEffect(() => {
    if (!paywallOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePaywall()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paywallOpen, closePaywall])

  if (!paywallOpen) return null

  const { plan, offer, offerStatus, offerError, canPurchase, busy, error } = billing
  const platform = Capacitor.getPlatform()
  const storeName = platform === 'android' ? t('billing.googlePlay') : t('billing.appStore')
  const accountName = platform === 'android' ? t('billing.googleAccount') : t('billing.appleAccount')
  const period = periodName(offer?.period ?? 'month')
  const price = offer ? `${offer.priceString} / ${period}` : ADVANCED_PRICE_LABEL
  const freePoints = [t('billing.freePicks', { count: PLAN_LIMITS.free }), t('billing.explainable'), t('billing.lists')]
  const advancedPoints = [t('billing.advancedPicks', { count: PLAN_LIMITS.advanced }), t('billing.everything'), t('billing.cancel')]

  const handlePurchase = async () => {
    const result = await billing.purchase()
    if (result === 'purchased') {
      toast.show(t('billing.welcome'), 'success')
      closePaywall()
    } else if (result === 'pending') {
      toast.show(t('billing.pending'))
      closePaywall()
    }
  }

  const handleRestore = async () => {
    const result = await billing.restore()
    if (result === 'restored') {
      toast.show(t('billing.restored'), 'success')
      closePaywall()
    } else if (result === 'none') {
      toast.show(t('billing.noneFound'))
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      className="fixed inset-0 z-[85] flex items-end justify-center bg-ink/85 p-0 animate-fade-in sm:items-center sm:p-6"
      onClick={closePaywall}
    >
      <div
        className="relative isolate max-h-[94dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface p-6 shadow-2xl ring-1 ring-white/10 animate-fade-up sm:rounded-[28px] sm:p-8 [scrollbar-width:thin]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={closePaywall}
          aria-label={t('common.close')}
          disabled={busy !== null}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          <X className="size-4" />
        </button>

        <span className="flex size-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <Sparkles className="size-6" />
        </span>

        {plan === 'advanced' ? (
          <>
            <h2 id="paywall-title" className="mt-5 text-2xl font-semibold tracking-tight text-white">
              {t('billing.onAdvanced')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              {t('billing.onAdvancedBody', { limit: PLAN_LIMITS.advanced })}
              {billing.expiresAt && ` ${billing.willRenew ? t('billing.renews', { date: formatPlanDate(billing.expiresAt) }) : t('billing.ends', { date: formatPlanDate(billing.expiresAt) })}`}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" onClick={() => void billing.manageSubscription()}>
                {t('billing.manageSub')}
              </Button>
              <Button variant="ghost" onClick={closePaywall}>
                {t('billing.done')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 id="paywall-title" className="mt-5 text-2xl font-semibold tracking-tight text-white">
              {t('billing.title')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/65 text-pretty">
              {t('billing.lead', { limit: PLAN_LIMITS.advanced, free: PLAN_LIMITS.free, price })}
            </p>

            <div className="mt-6 grid gap-3 min-[400px]:grid-cols-2">
              <PlanCard name={t('billing.free')} points={freePoints} />
              <PlanCard name={t('billing.advanced')} points={advancedPoints} highlighted />
            </div>

            {offer?.introPriceString && (
              <p className="mt-4 text-sm text-brand">{t('billing.intro', { intro: offer.introPriceString, period, price: `${offer.priceString} / ${period}` })}</p>
            )}

            {error && (
              <p role="alert" className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2">
              {canPurchase ? (
                <>
                  <Button
                    size="lg"
                    fullWidth
                    onClick={() => void handlePurchase()}
                    loading={busy === 'purchase' || offerStatus === 'loading'}
                    disabled={!offer || busy !== null}
                    leadingIcon={<Sparkles />}
                  >
                    {offerStatus === 'loading' ? t('billing.checking') : offer ? t('billing.subscribe', { price }) : t('billing.notAvailable')}
                  </Button>
                  {offerStatus === 'error' && (
                    <>
                      <p role="status" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs leading-5 text-white/60">
                        {t('billing.storeNoPrice')}{offerError && t('billing.storeSaid', { message: offerError })}
                      </p>
                      <Button variant="ghost" size="sm" onClick={() => void billing.loadOffer()} leadingIcon={<RotateCcw />}>
                        {t('billing.retry')}
                      </Button>
                    </>
                  )}
                  {offerStatus === 'unavailable' && (
                    <p role="status" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs leading-5 text-white/60">
                      {offerError ?? t('billing.noProduct')}
                    </p>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => void handleRestore()} loading={busy === 'restore'} disabled={busy !== null}>
                    {t('billing.restore')}
                  </Button>
                </>
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/70">
                  {Capacitor.isNativePlatform()
                    ? t('billing.nativeUnavailable')
                    : t('billing.webNote')}
                </p>
              )}
            </div>

            <p className="mt-5 text-[11px] leading-5 text-white/40 text-pretty">
              {canPurchase
                ? t('billing.disclosure', { account: accountName, period, store: storeName })
                : t('billing.disclosureWeb')}{' '}
              <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-white/70">
                {t('billing.terms')}
              </a>
              {PRIVACY_URL && (
                <>
                  {' · '}
                  <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-white/70">
                    {t('billing.privacy')}
                  </a>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function PlanCard({ name, points, highlighted = false }: { name: string; points: string[]; highlighted?: boolean }) {
  return (
    <div className={cn('rounded-2xl border p-4', highlighted ? 'border-brand/40 bg-brand/8' : 'border-white/10 bg-white/4')}>
      <p className={cn('text-[11px] font-bold uppercase tracking-[0.16em]', highlighted ? 'text-brand' : 'text-white/50')}>{name}</p>
      <ul className="mt-3 space-y-2">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-[13px] leading-5 text-white/80 [overflow-wrap:anywhere]">
            <Check className={cn('mt-0.5 size-3.5 shrink-0', highlighted ? 'text-brand' : 'text-white/40')} strokeWidth={3} />
            {point}
          </li>
        ))}
      </ul>
    </div>
  )
}

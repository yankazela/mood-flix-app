'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { Check, RotateCcw, Sparkles, X } from 'lucide-react'
import { ADVANCED_PRICE_LABEL, PLAN_LIMITS, PRIVACY_URL, TERMS_URL } from '@/lib/billing/config'
import { formatPlanDate } from '@/lib/billing/format'
import { useBilling } from '@/lib/store/billing-context'
import { useScrollLock } from '@/lib/hooks/use-scroll-lock'
import { Button } from '@/components/shared/button'
import { useToast } from '@/components/shared/toast'
import { cn } from '@/lib/utils'

const FREE_POINTS = [`${PLAN_LIMITS.free} mood-matched picks a day`, 'Explainable recommendations', 'Saved, liked and watched lists']
const ADVANCED_POINTS = [`${PLAN_LIMITS.advanced} mood-matched picks a day`, 'Everything in Free', 'Cancel any time']

/**
 * The upgrade sheet. On iPhone and Android it sells through the store; on the web it explains
 * where to subscribe. Apple reviews paywalls for the price, the renewal terms, a way to restore
 * purchases and links to the terms and privacy policy, so all of those live here.
 */
export function PaywallModal() {
  const billing = useBilling()
  const { paywallOpen, closePaywall } = billing
  const toast = useToast()
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

  const { plan, offer, offerStatus, canPurchase, busy, error } = billing
  const platform = Capacitor.getPlatform()
  const storeName = platform === 'android' ? 'Google Play' : 'the App Store'
  const accountName = platform === 'android' ? 'Google Play account' : 'Apple Account'
  const price = offer ? `${offer.priceString} / ${offer.period}` : ADVANCED_PRICE_LABEL
  const period = offer?.period ?? 'month'

  const handlePurchase = async () => {
    const result = await billing.purchase()
    if (result === 'purchased') {
      toast.show('Welcome to Advanced. Enjoy your picks.', 'success')
      closePaywall()
    } else if (result === 'pending') {
      toast.show('Your purchase is waiting for approval. Your plan updates once it goes through.')
      closePaywall()
    }
  }

  const handleRestore = async () => {
    const result = await billing.restore()
    if (result === 'restored') {
      toast.show('Your subscription is back on this account.', 'success')
      closePaywall()
    } else if (result === 'none') {
      toast.show('No active subscription was found for this store account.')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      className="fixed inset-0 z-[85] flex items-end justify-center bg-ink/80 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-6"
      onClick={closePaywall}
    >
      <div
        className="relative max-h-[94dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface p-6 shadow-2xl ring-1 ring-white/10 animate-fade-up sm:rounded-[28px] sm:p-8 [scrollbar-width:thin]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={closePaywall}
          aria-label="Close"
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
              You’re on Advanced
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              {PLAN_LIMITS.advanced} picks a day.
              {billing.expiresAt && ` ${billing.willRenew ? 'Renews' : 'Ends'} ${formatPlanDate(billing.expiresAt)}.`}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" onClick={() => void billing.manageSubscription()}>
                Manage subscription
              </Button>
              <Button variant="ghost" onClick={closePaywall}>
                Done
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 id="paywall-title" className="mt-5 text-2xl font-semibold tracking-tight text-white">
              Go Advanced
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/65 text-pretty">
              {PLAN_LIMITS.advanced} mood-matched picks a day instead of {PLAN_LIMITS.free}, for {price}.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <PlanCard name="Free" points={FREE_POINTS} />
              <PlanCard name="Advanced" points={ADVANCED_POINTS} highlighted />
            </div>

            {offer?.introPriceString && (
              <p className="mt-4 text-sm text-brand">Introductory price: {offer.introPriceString} for your first {period}, then {offer.priceString} / {period}.</p>
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
                    {offerStatus === 'loading' ? 'Checking the price' : offer ? `Subscribe for ${price}` : 'Not available right now'}
                  </Button>
                  {offerStatus === 'error' && (
                    <Button variant="ghost" size="sm" onClick={() => void billing.loadOffer()} leadingIcon={<RotateCcw />}>
                      Try loading the price again
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => void handleRestore()} loading={busy === 'restore'} disabled={busy !== null}>
                    Restore purchases
                  </Button>
                </>
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/70">
                  Subscribe from the UpMyMood app on iPhone or Android. Your plan follows your account, so it works here too.
                </p>
              )}
            </div>

            <p className="mt-5 text-[11px] leading-5 text-white/40 text-pretty">
              {canPurchase
                ? `Payment is charged to your ${accountName} when you confirm. The subscription renews automatically every ${period} at the same price unless you cancel at least 24 hours before the end of the current period. Manage or cancel it in your ${storeName} subscription settings.`
                : 'Subscriptions renew automatically each month unless cancelled through the store they were bought from.'}{' '}
              <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-white/70">
                Terms of Use
              </a>
              {PRIVACY_URL && (
                <>
                  {' · '}
                  <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-white/70">
                    Privacy Policy
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
          <li key={point} className="flex items-start gap-2 text-[13px] leading-5 text-white/80">
            <Check className={cn('mt-0.5 size-3.5 shrink-0', highlighted ? 'text-brand' : 'text-white/40')} strokeWidth={3} />
            {point}
          </li>
        ))}
      </ul>
    </div>
  )
}

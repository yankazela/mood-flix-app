'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Plan, PlanSource, Usage } from '@/lib/types'
import type { BillingOffer } from '@/lib/billing/types'
import { subscriptionSettingsUrl } from '@/lib/billing/config'
import { forget, identify, loadOffer, managementUrl, purchase as purchaseOffer, restore as restorePurchases, storeAvailable } from '@/lib/billing/store'
import { syncSubscription } from '@/lib/api/billing'
import { updateBackendSessionUser } from '@/lib/auth/backend-session'
import { useAuth } from '@/lib/store/auth-context'
import { useAppDispatch } from '@/store/hooks'
import { profileRefreshed } from '@/store/auth/slice'

export type OfferStatus = 'idle' | 'loading' | 'ready' | 'unavailable' | 'error'
export type BillingTask = 'purchase' | 'restore' | 'sync' | null
export type PurchaseResult = 'purchased' | 'pending' | 'cancelled' | 'failed'
export type RestoreResult = 'restored' | 'none' | 'failed'

export interface BillingContextValue {
  /** The plan as it stands right now; a lapsed subscription reads as free. */
  plan: Plan
  /** Where the person is against today's cap, from the latest answer the API gave. */
  usage: Usage | null
  expiresAt: string | null
  willRenew: boolean
  source: PlanSource | null
  /** True in the iOS and Android builds, where a subscription can be bought. */
  canPurchase: boolean
  offer: BillingOffer | null
  offerStatus: OfferStatus
  paywallOpen: boolean
  busy: BillingTask
  error: string | null
  openPaywall: () => void
  closePaywall: () => void
  loadOffer: () => Promise<void>
  purchase: () => Promise<PurchaseResult>
  restore: () => Promise<RestoreResult>
  /** Re-reads the plan from the backend, which re-reads it from the store. */
  refresh: () => Promise<void>
  manageSubscription: () => Promise<void>
  /** Called with the usage each recommendation answer carries, so the counter is right without a profile reload. */
  recordUsage: (usage: Usage) => void
}

const BillingContext = createContext<BillingContextValue | null>(null)

/** After the reset time the API would report a fresh day, so show one. */
function currentUsage(usage: Usage | null, now: number): Usage | null {
  if (!usage) return null
  const resetsAt = Date.parse(usage.resetsAt)
  if (Number.isFinite(resetsAt) && resetsAt <= now) return { ...usage, used: 0, remaining: usage.limit }
  return usage
}

export function BillingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const [latestUsage, setLatestUsage] = useState<Usage | null>(null)
  const [offer, setOffer] = useState<BillingOffer | null>(null)
  const [offerStatus, setOfferStatus] = useState<OfferStatus>('idle')
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [busy, setBusy] = useState<BillingTask>(null)
  const [error, setError] = useState<string | null>(null)
  const [clock, setClock] = useState(() => Date.now())

  const userId = user?.userId ?? null
  const canPurchase = storeAvailable()

  // The store SDK follows the signed-in person, so purchases attach to their account.
  useEffect(() => {
    if (!userId) {
      forget().catch((cause) => console.warn('[billing] Could not detach the store account:', cause))
      return
    }
    identify(userId).catch((cause) => console.warn('[billing] Could not identify with the store:', cause))
  }, [userId])

  // A fresh profile is the newest word on usage; anything recorded before it is stale.
  useEffect(() => {
    setLatestUsage(null)
  }, [user])

  const usage = useMemo(() => currentUsage(latestUsage ?? user?.usage ?? null, clock), [latestUsage, user, clock])

  // Re-render once the daily counter restarts, so "0 left" turns back into a full allowance.
  useEffect(() => {
    if (!usage) return
    const delay = Date.parse(usage.resetsAt) - Date.now()
    if (!Number.isFinite(delay) || delay <= 0) return
    const timer = setTimeout(() => setClock(Date.now()), Math.min(delay + 1000, 2 ** 31 - 1))
    return () => clearTimeout(timer)
  }, [usage])

  const plan: Plan = usage?.plan ?? user?.plan ?? 'free'

  const refresh = useCallback(async () => {
    const profile = await syncSubscription()
    updateBackendSessionUser(profile)
    dispatch(profileRefreshed(profile))
  }, [dispatch])

  const fetchOffer = useCallback(async () => {
    if (!canPurchase) {
      setOfferStatus('unavailable')
      return
    }
    setOfferStatus('loading')
    try {
      const loaded = await loadOffer()
      setOffer(loaded)
      setOfferStatus(loaded ? 'ready' : 'unavailable')
    } catch (cause) {
      console.warn('[billing] Could not load the offer:', cause)
      setOfferStatus('error')
    }
  }, [canPurchase])

  const openPaywall = useCallback(() => {
    setError(null)
    setPaywallOpen(true)
    if (offerStatus === 'idle' || offerStatus === 'error') void fetchOffer()
  }, [offerStatus, fetchOffer])

  const closePaywall = useCallback(() => {
    if (busy) return
    setPaywallOpen(false)
    setError(null)
  }, [busy])

  const purchase = useCallback(async (): Promise<PurchaseResult> => {
    if (!offer) return 'failed'
    setBusy('purchase')
    setError(null)
    try {
      const outcome = await purchaseOffer(offer)
      if (outcome === 'purchased') {
        // The webhook will catch up if this fails; the purchase itself is done.
        await refresh().catch((cause) => console.warn('[billing] Purchase done, profile sync pending:', cause))
      }
      return outcome
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The purchase did not go through.')
      return 'failed'
    } finally {
      setBusy(null)
    }
  }, [offer, refresh])

  const restore = useCallback(async (): Promise<RestoreResult> => {
    setBusy('restore')
    setError(null)
    try {
      const entitled = await restorePurchases()
      if (entitled) await refresh()
      return entitled ? 'restored' : 'none'
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Restoring purchases did not work.')
      return 'failed'
    } finally {
      setBusy(null)
    }
  }, [refresh])

  const manageSubscription = useCallback(async () => {
    const url = (await managementUrl()) ?? subscriptionSettingsUrl(user?.planSource)
    window.open(url, '_blank', 'noopener')
  }, [user?.planSource])

  const recordUsage = useCallback((next: Usage) => setLatestUsage(next), [])

  const value = useMemo<BillingContextValue>(
    () => ({
      plan,
      usage,
      expiresAt: user?.planExpiresAt ?? null,
      willRenew: user?.planWillRenew === true,
      source: user?.planSource ?? null,
      canPurchase,
      offer,
      offerStatus,
      paywallOpen,
      busy,
      error,
      openPaywall,
      closePaywall,
      loadOffer: fetchOffer,
      purchase,
      restore,
      refresh,
      manageSubscription,
      recordUsage,
    }),
    [plan, usage, user, canPurchase, offer, offerStatus, paywallOpen, busy, error, openPaywall, closePaywall, fetchOffer, purchase, restore, refresh, manageSubscription, recordUsage],
  )

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>
}

export function useBilling(): BillingContextValue {
  const context = useContext(BillingContext)
  if (!context) throw new Error('useBilling must be used within <BillingProvider>')
  return context
}

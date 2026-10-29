import { Capacitor } from '@capacitor/core'
import { LOG_LEVEL, PURCHASES_ERROR_CODE, Purchases, type CustomerInfo, type PurchasesPackage } from '@revenuecat/purchases-capacitor'
import { ENTITLEMENT_ID, revenueCatApiKey } from '@/lib/billing/config'
import { periodLabel } from '@/lib/billing/format'
import type { BillingOffer, PurchaseOutcome } from '@/lib/billing/types'

/**
 * The app's view of the store, through RevenueCat. Purchases happen in the iOS and Android builds
 * only; the web cannot buy, so every call here is a no-op or an error there. The person is
 * identified to the store by their Cognito sub, which is how the backend matches webhook events.
 */

let configured = false
let identifiedAs: string | null = null

/** True in a native build with a RevenueCat key: the paywall can sell. */
export function storeAvailable(): boolean {
  return Capacitor.isNativePlatform() && Boolean(revenueCatApiKey())
}

/** Attaches the store SDK to the signed-in person. Safe to call again for the same person. */
export async function identify(userId: string): Promise<void> {
  const apiKey = revenueCatApiKey()
  if (!Capacitor.isNativePlatform() || !apiKey || identifiedAs === userId) return
  if (!configured) {
    await Purchases.setLogLevel({ level: process.env.NODE_ENV === 'production' ? LOG_LEVEL.WARN : LOG_LEVEL.DEBUG })
    await Purchases.configure({ apiKey, appUserID: userId })
    configured = true
  } else {
    await Purchases.logIn({ appUserID: userId })
  }
  identifiedAs = userId
}

/** Detaches the SDK from the person who signed out; the next sign-in identifies again. */
export async function forget(): Promise<void> {
  if (!configured || identifiedAs === null) return
  identifiedAs = null
  try {
    await Purchases.logOut()
  } catch {
    // Already anonymous: nothing to clear.
  }
}

/** The Advanced offer as the store prices it, or null when the store has nothing to sell here. */
export async function loadOffer(): Promise<BillingOffer | null> {
  if (!storeAvailable()) return null
  const { current } = await Purchases.getOfferings()
  const pkg = current?.monthly ?? current?.availablePackages[0] ?? null
  return pkg ? toOffer(pkg) : null
}

export async function purchase(offer: BillingOffer): Promise<PurchaseOutcome> {
  if (!storeAvailable()) throw new Error(unavailableMessage('Subscriptions'))
  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: offer.package })
    return isEntitled(customerInfo) ? 'purchased' : 'pending'
  } catch (error) {
    if (isCancellation(error)) return 'cancelled'
    throw new Error(storeErrorMessage(error))
  }
}

/** Re-attaches purchases made with this store account. Resolves to whether Advanced is active afterwards. */
export async function restore(): Promise<boolean> {
  if (!storeAvailable()) throw new Error(unavailableMessage('Restoring purchases'))
  try {
    const { customerInfo } = await Purchases.restorePurchases()
    return isEntitled(customerInfo)
  } catch (error) {
    throw new Error(storeErrorMessage(error))
  }
}

/** The store's own page for this subscription, when it provides one. */
export async function managementUrl(): Promise<string | null> {
  if (!storeAvailable()) return null
  try {
    const { customerInfo } = await Purchases.getCustomerInfo()
    return customerInfo.managementURL
  } catch {
    return null
  }
}

function unavailableMessage(what: string): string {
  return Capacitor.isNativePlatform()
    ? `${what} aren’t available in this version of the app yet.`
    : `${what} work in the UpMyMood app for iPhone and Android.`
}

/** Says, once per session and only in an app build, which key is missing; the UI itself stays quiet about it. */
let warnedAboutKey = false
export function warnIfStoreUnconfigured(): void {
  if (warnedAboutKey || !Capacitor.isNativePlatform() || revenueCatApiKey()) return
  warnedAboutKey = true
  const variable = Capacitor.getPlatform() === 'ios' ? 'NEXT_PUBLIC_REVENUECAT_IOS_KEY' : 'NEXT_PUBLIC_REVENUECAT_ANDROID_KEY'
  console.warn(`[billing] No RevenueCat key for ${Capacitor.getPlatform()}: set ${variable} in .env and rebuild to enable purchases.`)
}

function toOffer(pkg: PurchasesPackage): BillingOffer {
  return {
    productId: pkg.product.identifier,
    title: pkg.product.title,
    priceString: pkg.product.priceString,
    period: periodLabel(pkg.product.subscriptionPeriod),
    introPriceString: pkg.product.introPrice?.priceString ?? null,
    package: pkg,
  }
}

function isEntitled(info: CustomerInfo): boolean {
  return Boolean(info.entitlements.active[ENTITLEMENT_ID])
}

function isCancellation(error: unknown): boolean {
  const failure = error as { code?: unknown; userCancelled?: unknown } | null
  return failure?.userCancelled === true || String(failure?.code) === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
}

function storeErrorMessage(error: unknown): string {
  const failure = error as { message?: unknown; underlyingErrorMessage?: unknown } | null
  const message = [failure?.message, failure?.underlyingErrorMessage].find((text) => typeof text === 'string' && text.trim())
  return typeof message === 'string' ? message : 'The store did not respond. Please try again.'
}

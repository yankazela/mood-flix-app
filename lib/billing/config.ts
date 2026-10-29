import { Capacitor } from '@capacitor/core'
import type { Plan } from '@/lib/types'

/** The RevenueCat entitlement that unlocks the Advanced plan. Must match the backend's REVENUECAT_ENTITLEMENT_ID. */
export const ENTITLEMENT_ID = process.env.NEXT_PUBLIC_REVENUECAT_ENTITLEMENT || 'upmymood_pro'

/** Apple requires both links on a paywall. The Terms default is Apple's standard EULA. */
export const TERMS_URL = process.env.NEXT_PUBLIC_TERMS_URL || 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'
export const PRIVACY_URL = process.env.NEXT_PUBLIC_PRIVACY_URL || ''

/** Shown only where the store price cannot be read (the web). Native screens always show the store's own price. */
export const ADVANCED_PRICE_LABEL = process.env.NEXT_PUBLIC_ADVANCED_PRICE_LABEL || 'US$3.99 / month'

/** Requests per day by plan, for the comparison on the paywall. The API's `usage.limit` is authoritative for the current plan. */
export const PLAN_LIMITS: Record<Plan, number> = { free: 2, advanced: 15 }

/** The RevenueCat public SDK key for the platform this build runs on; none on the web. */
export function revenueCatApiKey(): string | undefined {
  const platform = Capacitor.getPlatform()
  if (platform === 'ios') return process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY || undefined
  if (platform === 'android') return process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY || undefined
  return undefined
}

/** Where a subscription is managed when the store does not hand us a link. */
export function subscriptionSettingsUrl(source?: string): string {
  const platform = Capacitor.getPlatform()
  if (platform === 'android' || source === 'google') return 'https://play.google.com/store/account/subscriptions'
  return 'https://apps.apple.com/account/subscriptions'
}

import type { PurchasesPackage } from '@revenuecat/purchases-capacitor'

/** What the store offers for the Advanced plan, with the price as the store localises it. */
export interface BillingOffer {
  productId: string
  title: string
  /** Localised, from the store, e.g. "$3.99". */
  priceString: string
  /** "month", "year" or "week". */
  period: string
  /** Localised introductory price when the product has one. */
  introPriceString: string | null
  /** The store package behind the offer. Only the store adapter reads it. */
  package: PurchasesPackage
}

export type PurchaseOutcome = 'purchased' | 'cancelled' | 'pending'

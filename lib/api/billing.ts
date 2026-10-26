import type { UserDetails } from '@/app/(auth)/signup/store/state'
import { apiPost } from '@/lib/api/client'

/** Asks the backend to re-read the subscription from the store. Resolves to the refreshed profile, plan and usage included. */
export async function syncSubscription(): Promise<UserDetails> {
  const { user } = await apiPost<{ user: UserDetails }>('/billing/sync', {})
  return user
}

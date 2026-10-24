import type { ApiLibraryPatch } from '@/lib/api/types'
import type { UserDetails } from '@/app/(auth)/signup/store/state'
import { apiGet, apiPatch } from '@/lib/api/client'

/** The signed-in user's profile, with their saved titles. */
export async function fetchProfile(): Promise<UserDetails> {
  const { user } = await apiGet<{ user: UserDetails }>('/user/me')
  return user
}

/** Saves library changes (saved, watched, thumbs, ratings) on the profile. Resolves to the updated profile. */
export async function patchLibrary(patch: ApiLibraryPatch): Promise<UserDetails> {
  const { user } = await apiPatch<{ user: UserDetails }>('/user', patch)
  return user
}

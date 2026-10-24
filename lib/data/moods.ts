import type { UserMood, UserMoodId } from '@/lib/types'

/** Quick mood chips. Their ids are sent to the API alongside the user's own words. */
export const USER_MOODS: UserMood[] = [
  { id: 'stressed', label: 'Stressed', emoji: '😫' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'happy', label: 'Happy', emoji: '😃' },
  { id: 'bored', label: 'Bored', emoji: '😐' },
  { id: 'romantic', label: 'Romantic', emoji: '🥰' },
  { id: 'excited', label: 'Excited', emoji: '🤩' },
  { id: 'relax', label: 'Need to relax', emoji: '😌', phrase: 'in need of some relaxation' },
]

export const MOOD_MAP: Record<UserMoodId, UserMood> = Object.fromEntries(
  USER_MOODS.map((mood) => [mood.id, mood]),
) as Record<UserMoodId, UserMood>

export function getMood(id: UserMoodId): UserMood {
  return MOOD_MAP[id]
}

export function isMoodId(value: string): value is UserMoodId {
  return value in MOOD_MAP
}

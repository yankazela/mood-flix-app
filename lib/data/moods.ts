import type { UserMood, UserMoodId } from '@/lib/types'

/** Quick moods. Their ids are sent to the API alongside the user's own words; the images live under public/. */
export const USER_MOODS: UserMood[] = [
  { id: 'stressed', label: 'Stressed', emoji: '😫', image: '/stressed.png' },
  { id: 'tired', label: 'Tired', emoji: '😴', image: '/tired.png' },
  { id: 'sad', label: 'Sad', emoji: '😢', image: '/anxiety.png' },
  { id: 'happy', label: 'Happy', emoji: '😃', image: '/happy.png' },
  { id: 'bored', label: 'Bored', emoji: '😐', image: '/apathetic.png' },
  { id: 'romantic', label: 'Romantic', emoji: '🥰', image: '/happy-couple.png' },
  { id: 'excited', label: 'Excited', emoji: '🤩', image: '/excitement.png' },
  { id: 'relax', label: 'Need to relax', emoji: '😌', phrase: 'in need of some relaxation', image: '/meditation.png' },
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

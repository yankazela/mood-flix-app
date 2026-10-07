import type { UserMood, UserMoodId } from '@/lib/types'

/**
 * Each mood maps to the emotional fingerprint the user is *looking for*,
 * not the one they are currently in. Someone stressed wants comfort and
 * low intensity; someone excited wants high-energy thrills.
 */
export const USER_MOODS: UserMood[] = [
  {
    id: 'stressed',
    label: 'Stressed',
    emoji: '😫',
    desired: { funny: 75, comforting: 85, exciting: 35, dark: 10, intensity: 25 },
    descriptors: ['relaxing', 'light', 'easy to watch'],
  },
  {
    id: 'tired',
    label: 'Tired',
    emoji: '😴',
    desired: { funny: 60, comforting: 90, exciting: 30, dark: 10, intensity: 20 },
    descriptors: ['comforting', 'low-effort', 'cozy'],
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '😢',
    desired: { funny: 55, comforting: 95, exciting: 30, dark: 15, romantic: 40, intensity: 30 },
    descriptors: ['uplifting', 'heartwarming', 'gentle'],
  },
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😃',
    desired: { funny: 80, comforting: 60, exciting: 65, dark: 10, intensity: 45 },
    descriptors: ['fun', 'upbeat', 'feel-good'],
  },
  {
    id: 'bored',
    label: 'Bored',
    emoji: '😐',
    desired: { funny: 40, comforting: 30, exciting: 90, dark: 45, intensity: 75 },
    descriptors: ['gripping', 'surprising', 'high-energy'],
  },
  {
    id: 'romantic',
    label: 'Romantic',
    emoji: '🥰',
    desired: { funny: 50, comforting: 70, exciting: 35, dark: 10, romantic: 95, intensity: 35 },
    descriptors: ['romantic', 'tender', 'swoon-worthy'],
  },
  {
    id: 'excited',
    label: 'Excited',
    emoji: '🤩',
    desired: { funny: 45, comforting: 30, exciting: 95, dark: 35, intensity: 85 },
    descriptors: ['thrilling', 'big', 'adrenaline-filled'],
  },
  {
    id: 'relax',
    label: 'Need to relax',
    emoji: '😌',
    desired: { funny: 65, comforting: 90, exciting: 25, dark: 5, intensity: 15 },
    descriptors: ['calm', 'soothing', 'easygoing'],
  },
]

export const MOOD_MAP: Record<UserMoodId, UserMood> = Object.fromEntries(
  USER_MOODS.map((mood) => [mood.id, mood]),
) as Record<UserMoodId, UserMood>

export function getMood(id: UserMoodId): UserMood {
  return MOOD_MAP[id]
}

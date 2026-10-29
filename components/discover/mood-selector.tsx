'use client'

import type { UserMoodId } from '@/lib/types'
import { USER_MOODS } from '@/lib/data/moods'
import { SelectMenu } from '@/components/shared/select-menu'

interface MoodSelectorProps {
  selected: UserMoodId[]
  onToggle: (mood: UserMoodId) => void
  disabled?: boolean
  className?: string
}

/** Quick moods as a multi-select dropdown; each option carries its illustration from public/. */
export function MoodSelector({ selected, onToggle, disabled = false, className }: MoodSelectorProps) {
  const options = USER_MOODS.map((mood) => ({
    value: mood.id,
    label: mood.label,
    image: mood.image,
    icon: mood.image ? undefined : <span className="text-base leading-none">{mood.emoji}</span>,
  }))

  return (
    <SelectMenu
      label="Moods"
      prefix="I’m feeling"
      options={options}
      selected={selected}
      onSelect={onToggle}
      multiple
      placeholder="Pick a mood or two"
      disabled={disabled}
      className={className}
    />
  )
}

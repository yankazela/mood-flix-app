'use client'

import { Sparkles, Waves } from 'lucide-react'
import type { MoodObjective } from '@/lib/types'
import { SelectMenu, type SelectMenuOption } from '@/components/shared/select-menu'

interface ObjectiveToggleProps {
  value: MoodObjective
  onChange: (value: MoodObjective) => void
  disabled?: boolean
  className?: string
}

const OPTIONS: SelectMenuOption<MoodObjective>[] = [
  { value: 'keep', label: 'Match my mood', hint: 'Something that sits with how I feel', icon: <Waves /> },
  { value: 'improve', label: 'Lift my mood', hint: 'Something that brightens it', icon: <Sparkles /> },
]

/** Whether recommendations should meet the mood the user is in, or nudge it somewhere better. */
export function ObjectiveToggle({ value, onChange, disabled = false, className }: ObjectiveToggleProps) {
  return (
    <SelectMenu
      label="What the pick should do"
      prefix="I’d like something to"
      options={OPTIONS}
      selected={[value]}
      onSelect={onChange}
      placeholder="Choose"
      disabled={disabled}
      className={className}
    />
  )
}

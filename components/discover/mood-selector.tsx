'use client'

import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const options = USER_MOODS.map((mood) => ({
    value: mood.id,
    label: t(`data.moods.${mood.id}`),
    image: mood.image,
    icon: mood.image ? undefined : <span className="text-base leading-none">{mood.emoji}</span>,
  }))

  return (
    <SelectMenu
      label={t('discover.moodsLabel')}
      prefix={t('discover.feeling')}
      options={options}
      selected={selected}
      onSelect={onToggle}
      multiple
      placeholder={t('discover.pickMood')}
      disabled={disabled}
      className={className}
    />
  )
}

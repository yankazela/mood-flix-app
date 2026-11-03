'use client'

import { useTranslation } from 'react-i18next'
import { Sparkles, Waves } from 'lucide-react'
import type { MoodObjective } from '@/lib/types'
import { SelectMenu, type SelectMenuOption } from '@/components/shared/select-menu'

interface ObjectiveToggleProps {
  value: MoodObjective
  onChange: (value: MoodObjective) => void
  disabled?: boolean
  className?: string
}


/** Whether recommendations should meet the mood the user is in, or nudge it somewhere better. */
export function ObjectiveToggle({ value, onChange, disabled = false, className }: ObjectiveToggleProps) {
  const { t } = useTranslation()
  const OPTIONS: SelectMenuOption<MoodObjective>[] = [
    { value: 'keep', label: t('discover.keep'), hint: t('discover.keepHint'), icon: <Waves /> },
    { value: 'improve', label: t('discover.improve'), hint: t('discover.improveHint'), icon: <Sparkles /> },
  ]
  return (
    <SelectMenu
      label={t('discover.objectiveLabel')}
      prefix={t('discover.wantTo')}
      options={OPTIONS}
      selected={[value]}
      onSelect={onChange}
      placeholder={t('discover.choose')}
      disabled={disabled}
      className={className}
    />
  )
}

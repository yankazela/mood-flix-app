'use client'

import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useLibrary } from '@/lib/store/library-context'
import { useToast } from '@/components/shared/toast'

/** Tells the user when a save to their library did not go through (the library is then reloaded from the server). */
export function LibrarySyncToaster() {
  const { syncError, clearSyncError } = useLibrary()
  const toast = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    if (!syncError) return
    toast.show(t('toasts.saveFailed', { detail: syncError }))
    clearSyncError()
  }, [syncError, clearSyncError, toast, t])

  return null
}

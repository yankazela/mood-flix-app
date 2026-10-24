'use client'

import { useEffect } from 'react'
import { useLibrary } from '@/lib/store/library-context'
import { useToast } from '@/components/shared/toast'

/** Tells the user when a save to their library did not go through (the library is then reloaded from the server). */
export function LibrarySyncToaster() {
  const { syncError, clearSyncError } = useLibrary()
  const toast = useToast()

  useEffect(() => {
    if (!syncError) return
    toast.show(`We couldn’t save that change. ${syncError}`)
    clearSyncError()
  }, [syncError, clearSyncError, toast])

  return null
}

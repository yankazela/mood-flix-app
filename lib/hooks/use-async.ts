'use client'

import { useEffect, useState } from 'react'

export interface AsyncState<T> {
  data: T
  loading: boolean
  error: string | null
}

/** Runs `load` on mount and whenever `key` changes, ignoring results that arrive after the key has moved on. */
export function useAsync<T>(load: () => Promise<T>, key: string, initial: T): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: initial, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState((current) => ({ ...current, loading: true, error: null }))
    load()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ data: initial, loading: false, error: error instanceof Error ? error.message : 'Something went wrong.' })
      })
    return () => {
      cancelled = true
    }
    // `load` and `initial` are recreated every render; `key` says when the inputs really changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}

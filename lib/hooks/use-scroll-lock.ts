'use client'

import { useEffect } from 'react'

/** Locks body scroll while `active` is true (modals, sheets, overlays). */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const { overflow, paddingRight } = document.body.style
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [active])
}

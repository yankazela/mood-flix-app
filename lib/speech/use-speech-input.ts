'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRecognizer, type SpeechSession } from '@/lib/speech/recognizer'

export type SpeechStatus = 'idle' | 'starting' | 'listening'

interface UseSpeechInputOptions {
  /** Called with the full text to show: what was there before plus what has been heard so far. */
  onText: (text: string) => void
}

/** Dictation into a text field. Words appear as they are recognised, after whatever was already typed. */
export function useSpeechInput({ onText }: UseSpeechInputOptions) {
  const recognizer = useMemo(() => createRecognizer(), [])
  const [supported, setSupported] = useState<boolean | null>(null)
  const [status, setStatus] = useState<SpeechStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<SpeechSession | null>(null)
  const baseRef = useRef('')
  const onTextRef = useRef(onText)
  onTextRef.current = onText

  useEffect(() => {
    let cancelled = false
    recognizer.isSupported().then((ok) => {
      if (!cancelled) setSupported(ok)
    })
    return () => {
      cancelled = true
    }
  }, [recognizer])

  // Leaving the screen mid-sentence must not leave the microphone on.
  useEffect(() => () => void sessionRef.current?.stop().catch(() => undefined), [])

  const stop = useCallback(async () => {
    const session = sessionRef.current
    sessionRef.current = null
    await session?.stop().catch(() => undefined)
    setStatus('idle')
  }, [])

  const start = useCallback(
    async (currentText: string) => {
      if (status !== 'idle') return
      setError(null)
      setStatus('starting')
      baseRef.current = currentText.trim()
      try {
        sessionRef.current = await recognizer.start(navigator.language || 'en-US', {
          onTranscript: (heard) => {
            const base = baseRef.current
            onTextRef.current(base ? `${base} ${heard}` : capitalise(heard))
          },
          onEnd: () => {
            sessionRef.current = null
            setStatus('idle')
          },
          onError: (message) => setError(message),
        })
        setStatus('listening')
      } catch (cause) {
        sessionRef.current = null
        setStatus('idle')
        setError(cause instanceof Error ? cause.message : 'We couldn’t start listening. Please try again.')
      }
    },
    [recognizer, status],
  )

  const toggle = useCallback((currentText: string) => (status === 'idle' ? start(currentText) : stop()), [status, start, stop])

  return { supported, status, error, start, stop, toggle, clearError: () => setError(null) }
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

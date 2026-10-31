'use client'

import { useEffect, useRef, type KeyboardEvent } from 'react'
import { ArrowRight, Mic, Sparkles, Square } from 'lucide-react'
import { useSpeechInput } from '@/lib/speech/use-speech-input'
import { Button } from '@/components/shared/button'
import { cn } from '@/lib/utils'

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  /** Text arriving from dictation. Falls back to onChange when not given. */
  onVoiceChange?: (value: string) => void
  onSubmit: () => void
  loading?: boolean
  canSubmit?: boolean
  className?: string
  children?: React.ReactNode
}

const PLACEHOLDER = 'Long day at work. I want something funny, relaxing and easy to watch...'
const LISTENING_PLACEHOLDER = 'Listening… tell me how you feel and what you’re in the mood for.'

export function PromptInput({ value, onChange, onVoiceChange, onSubmit, loading = false, canSubmit = true, className, children }: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const speech = useSpeechInput({ onText: onVoiceChange ?? onChange })
  const listening = speech.status !== 'idle'

  // Auto-grow the textarea with its content.
  useEffect(() => {
    const node = textareaRef.current
    if (!node) return
    node.style.height = '0px'
    node.style.height = `${Math.min(node.scrollHeight, 220)}px`
  }, [value])

  // Submitting or typing ends dictation; the microphone should never stay on unnoticed.
  useEffect(() => {
    if (loading && listening) void speech.stop()
  }, [loading, listening, speech])

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      if (canSubmit && !loading) onSubmit()
    }
  }

  return (
    <div
      className={cn(
        'group/prompt relative rounded-[28px] p-px transition-shadow duration-500',
        'bg-gradient-to-br from-white/15 via-white/5 to-brand/30 focus-within:from-brand/60 focus-within:via-white/10 focus-within:to-brand/50 focus-within:shadow-[0_0_80px_-20px_rgba(217,246,107,0.45)]',
        listening && 'from-brand/60 via-white/10 to-brand/50 shadow-[0_0_80px_-20px_rgba(217,246,107,0.45)]',
        className,
      )}
    >
      <div className="relative rounded-[27px] bg-surface/95 backdrop-blur-xl">
        <div className="pointer-events-none absolute left-5 top-5 text-brand sm:left-6 sm:top-6">
          <Sparkles className="size-5 animate-glow" />
        </div>
        <label htmlFor="mood-prompt" className="sr-only">
          Describe how you feel and what you want to watch
        </label>
        <textarea
          id="mood-prompt"
          ref={textareaRef}
          value={value}
          onChange={(event) => {
            if (listening) void speech.stop()
            onChange(event.target.value)
          }}
          onKeyDown={handleKeyDown}
          placeholder={listening ? LISTENING_PLACEHOLDER : PLACEHOLDER}
          rows={2}
          disabled={loading}
          enterKeyHint="search"
          className={cn(
            'block w-full resize-none bg-transparent py-5 pl-14 pr-5 text-[17px] leading-7 text-white outline-none placeholder:text-white/30 disabled:opacity-60 sm:py-6 sm:pl-16 sm:pr-6 sm:text-lg sm:leading-8',
            speech.supported !== false && 'pr-16 sm:pr-[4.5rem]',
          )}
        />

        {speech.supported !== false && (
          <button
            type="button"
            onClick={() => void speech.toggle(value)}
            disabled={loading || speech.status === 'starting'}
            aria-pressed={listening}
            aria-label={listening ? 'Stop listening' : 'Speak instead of typing'}
            title={listening ? 'Stop listening' : 'Speak instead of typing'}
            className={cn(
              'absolute right-4 top-4 flex size-10 items-center justify-center rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand/70 disabled:opacity-50 sm:right-5 sm:top-5',
              listening ? 'bg-brand text-brand-foreground' : 'bg-white/6 text-white/60 hover:bg-white/10 hover:text-white',
            )}
          >
            {listening && <span className="absolute inset-0 rounded-full bg-brand/40 animate-ping" aria-hidden />}
            {listening ? <Square className="relative size-4 fill-current" /> : <Mic className="size-[18px]" />}
          </button>
        )}

        {(listening || speech.error) && (
          <p role="status" aria-live="polite" className={cn('px-5 pb-1 text-xs sm:px-6', speech.error ? 'text-destructive' : 'text-brand/80')}>
            {speech.error ?? 'Listening… tap the square when you’re done.'}
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-white/6 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-xs text-white/40">{children}</div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="hidden text-[11px] text-white/30 sm:inline">
              <kbd className="rounded border border-white/15 px-1.5 py-0.5 font-sans">⌘</kbd> + <kbd className="rounded border border-white/15 px-1.5 py-0.5 font-sans">↵</kbd>
            </span>
            <Button size="lg" onClick={onSubmit} loading={loading} disabled={!canSubmit} trailingIcon={<ArrowRight />} className="w-full sm:w-auto">
              {loading ? 'Finding your movie' : 'Find my movie'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

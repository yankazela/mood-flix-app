'use client'

import { useEffect, useRef, type KeyboardEvent } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/shared/button'
import { cn } from '@/lib/utils'

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  loading?: boolean
  canSubmit?: boolean
  className?: string
  children?: React.ReactNode
}

const PLACEHOLDER = 'Long day at work. I want something funny, relaxing and easy to watch...'

export function PromptInput({ value, onChange, onSubmit, loading = false, canSubmit = true, className, children }: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow the textarea with its content.
  useEffect(() => {
    const node = textareaRef.current
    if (!node) return
    node.style.height = '0px'
    node.style.height = `${Math.min(node.scrollHeight, 220)}px`
  }, [value])

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
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDER}
          rows={2}
          disabled={loading}
          enterKeyHint="search"
          className="block w-full resize-none bg-transparent py-5 pl-14 pr-5 text-[17px] leading-7 text-white outline-none placeholder:text-white/30 disabled:opacity-60 sm:py-6 sm:pl-16 sm:pr-6 sm:text-lg sm:leading-8"
        />
        <div className="flex flex-col gap-3 border-t border-white/6 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2 text-xs text-white/40">{children}</div>
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

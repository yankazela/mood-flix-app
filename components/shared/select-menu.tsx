'use client'

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, X } from 'lucide-react'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import { useScrollLock } from '@/lib/hooks/use-scroll-lock'
import { Button } from '@/components/shared/button'
import { cn } from '@/lib/utils'

export interface SelectMenuOption<T extends string> {
  value: T
  label: string
  hint?: string
  /** Illustration under public/, shown before the label. */
  image?: string
  /** Shown when there is no image. */
  icon?: ReactNode
}

interface SelectMenuProps<T extends string> {
  /** Accessible name of the list and the title of the phone sheet, e.g. "Moods". */
  label: string
  /** Short lead-in rendered before the trigger, e.g. "I'm feeling". */
  prefix?: string
  options: SelectMenuOption<T>[]
  selected: T[]
  /** Called with the option picked. With `multiple` the parent toggles; otherwise it replaces. */
  onSelect: (value: T) => void
  multiple?: boolean
  placeholder: string
  disabled?: boolean
  className?: string
}

const MENU_WIDTH = 320
const GUTTER = 16

/**
 * A dropdown list: an anchored popover on desktop, a bottom sheet on phones. The list is portaled
 * to <body> so it sits above everything else, and it avoids backdrop filters, which Android's
 * WebView composites badly.
 */
export function SelectMenu<T extends string>({ label, prefix, options, selected, onSelect, multiple = false, placeholder, disabled = false, className }: SelectMenuProps<T>) {
  const id = useId()
  const listId = `${id}-list`
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  useScrollLock(open && !isDesktop)

  useEffect(() => setMounted(true), [])

  const position = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const width = Math.min(MENU_WIDTH, window.innerWidth - GUTTER * 2)
    const left = Math.max(GUTTER, Math.min(rect.left, window.innerWidth - width - GUTTER))
    const top = rect.bottom + 8
    setAnchor({ top, left, width, maxHeight: Math.max(240, window.innerHeight - top - GUTTER) })
  }, [])

  useLayoutEffect(() => {
    if (!open || !isDesktop) return
    position()
    window.addEventListener('resize', position)
    return () => window.removeEventListener('resize', position)
  }, [open, isDesktop, position])

  const close = useCallback((refocus = false) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: globalThis.KeyboardEvent) => event.key === 'Escape' && close(true)
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      close()
    }
    const onScroll = () => isDesktop && close()
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('scroll', onScroll)
    }
  }, [open, isDesktop, close])

  // Keyboard users land on the current choice when the list opens.
  useEffect(() => {
    if (!open) return
    const menu = menuRef.current
    const current = menu?.querySelector<HTMLButtonElement>('[role="option"][aria-selected="true"]') ?? menu?.querySelector<HTMLButtonElement>('[role="option"]')
    current?.focus({ preventScroll: true })
  }, [open, anchor])

  const onOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])
    const index = items.indexOf(event.currentTarget)
    const next =
      event.key === 'ArrowDown' ? items[(index + 1) % items.length]
      : event.key === 'ArrowUp' ? items[(index - 1 + items.length) % items.length]
      : event.key === 'Home' ? items[0]
      : items[items.length - 1]
    next?.focus()
  }

  const choose = (value: T) => {
    onSelect(value)
    if (!multiple) close(true)
  }

  const chosen = options.filter((option) => selected.includes(option.value))
  const summary = chosen.length === 0 ? placeholder : chosen.map((option) => option.label).join(', ')

  const list = (
    <div role="listbox" id={listId} aria-label={label} aria-multiselectable={multiple || undefined} className="min-h-0 flex-1 overflow-y-auto p-1.5 [scrollbar-width:thin]">
      {options.map((option) => {
        const active = selected.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => choose(option.value)}
            onKeyDown={onOptionKeyDown}
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors outline-none focus-visible:bg-white/8',
              active ? 'bg-brand/10' : 'hover:bg-white/6',
            )}
          >
            <OptionVisual option={option} />
            <span className="min-w-0 flex-1">
              <span className={cn('block text-sm font-medium', active ? 'text-brand' : 'text-white')}>{option.label}</span>
              {option.hint && <span className="block text-xs text-white/45">{option.hint}</span>}
            </span>
            <span
              className={cn('flex size-5 shrink-0 items-center justify-center rounded-full border transition-all', active ? 'border-brand bg-brand text-brand-foreground' : 'border-white/15 text-transparent')}
              aria-hidden
            >
              <Check className="size-3" strokeWidth={3} />
            </span>
          </button>
        )
      })}
    </div>
  )

  const menu = (
    <>
      {!isDesktop && <div className="fixed inset-0 z-[70] bg-ink/80 animate-fade-in" onClick={() => close()} aria-hidden />}
      <div
        ref={menuRef}
        className={cn(
          'fixed z-[75] flex flex-col bg-surface-2 shadow-2xl ring-1 ring-white/10',
          isDesktop ? 'rounded-3xl animate-scale-in' : 'inset-x-0 bottom-0 max-h-[80dvh] rounded-t-[28px] animate-fade-up',
        )}
        style={isDesktop && anchor ? { top: anchor.top, left: anchor.left, width: anchor.width, maxHeight: anchor.maxHeight } : undefined}
      >
        {!isDesktop && (
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
            <h3 className="text-base font-semibold text-white">{label}</h3>
            <button type="button" onClick={() => close()} aria-label="Close" className="flex size-9 items-center justify-center rounded-full text-white/50 hover:bg-white/8 hover:text-white">
              <X className="size-4" />
            </button>
          </div>
        )}
        {list}
        {!isDesktop && multiple && (
          <div className="border-t border-white/6 px-5 py-4 safe-bottom">
            <Button fullWidth onClick={() => close()} leadingIcon={<Check />}>
              Done
            </Button>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className={cn('inline-flex min-w-0 max-w-full items-center gap-2', className)}>
      {prefix && <span className="shrink-0 text-xs text-white/35">{prefix}</span>}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${label}: ${summary}`}
        className={cn(
          'inline-flex h-10 min-w-0 max-w-full items-center gap-2 rounded-full border pr-3 text-[13px] font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand/70 disabled:opacity-50',
          chosen.length > 0 ? 'border-brand/60 bg-brand/12 pl-1.5 text-brand' : 'border-white/10 bg-white/4 pl-3.5 text-white/60 hover:border-white/20 hover:text-white',
        )}
      >
        <TriggerVisuals chosen={chosen} />
        <span className="truncate">{summary}</span>
        <ChevronDown className={cn('size-3.5 shrink-0 text-white/40 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && mounted && (isDesktop ? anchor !== null : true) && createPortal(menu, document.body)}
    </div>
  )
}

function OptionVisual<T extends string>({ option }: { option: SelectMenuOption<T> }) {
  if (option.image) {
    return <img src={option.image} alt="" aria-hidden draggable={false} className="size-9 shrink-0 select-none object-contain" />
  }
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/6 text-white/70 [&_svg]:size-4" aria-hidden>
      {option.icon}
    </span>
  )
}

/** The first few choices as small badges on the trigger, so the pick reads at a glance. */
function TriggerVisuals<T extends string>({ chosen }: { chosen: SelectMenuOption<T>[] }) {
  const shown = chosen.slice(0, 3)
  if (shown.length === 0) return null
  return (
    <span className="flex shrink-0 -space-x-2" aria-hidden>
      {shown.map((option) =>
        option.image ? (
          <img key={option.value} src={option.image} alt="" draggable={false} className="size-7 rounded-full bg-surface-2 object-contain p-0.5 ring-2 ring-surface" />
        ) : (
          <span key={option.value} className="flex size-7 items-center justify-center rounded-full bg-white/10 ring-2 ring-surface [&_svg]:size-3.5">
            {option.icon}
          </span>
        ),
      )}
    </span>
  )
}

import React, { useRef } from 'react'

type TabKey = string

export type TabItem = {
  key: TabKey
  label: string
  disabled?: boolean
}

type TabsProps = {
  items: TabItem[]
  activeKey: TabKey
  onChange: (k: TabKey) => void
  ariaLabel?: string
  className?: string
}

type TabButtonClassNameOptions = {
  active: boolean
  disabled?: boolean
  className?: string
}

const join = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ')

export const getTabListClassName = (className?: string) =>
  join(
    'inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-100/80 p-1 shadow-sm',
    className,
  )

export const getTabButtonClassName = ({ active, disabled = false, className }: TabButtonClassNameOptions) =>
  join(
    'inline-flex min-h-10 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1',
    active
      ? 'bg-white text-sky-700 shadow-sm ring-1 ring-sky-100'
      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
    disabled ? 'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-slate-600' : '',
    className,
  )

export const getTabActionClassName = (className?: string) =>
  join(
    'inline-flex min-h-10 items-center justify-center rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium',
    'text-slate-500 transition-all duration-150 hover:border-sky-300 hover:bg-white hover:text-sky-700',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1',
    className,
  )

export default function Tabs({ items, activeKey, onChange, ariaLabel = 'Tabs', className }: TabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const dir = e.key === 'ArrowRight' ? 1 : -1
      let next = index + dir
      if (next < 0) next = items.length - 1
      if (next >= items.length) next = 0
      const btn = refs.current[next]
      if (btn) {
        btn.focus()
        if (!items[next].disabled) onChange(items[next].key)
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!items[index].disabled) onChange(items[index].key)
    }
  }

  return (
    <div role="tablist" aria-orientation="horizontal" aria-label={ariaLabel} className={getTabListClassName(className)}>
      {items.map((it, idx) => {
        const active = activeKey === it.key

        return (
          <button
            key={it.key}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`tabpanel-${it.key}`}
            id={`tab-${it.key}`}
            disabled={it.disabled}
            tabIndex={active ? 0 : -1}
            ref={el => { refs.current[idx] = el }}
            onKeyDown={(e) => onKeyDown(e, idx)}
            onClick={() => !it.disabled && onChange(it.key)}
            className={getTabButtonClassName({ active, disabled: it.disabled })}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}

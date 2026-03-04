import React, { useRef } from 'react'

type TabKey = string

export type TabItem = {
  key: TabKey
  label: string
}

type TabsProps = {
  items: TabItem[]
  activeKey: TabKey
  onChange: (k: TabKey) => void
}

export default function Tabs({ items, activeKey, onChange }: TabsProps) {
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
        onChange(items[next].key)
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onChange(items[index].key)
    }
  }

  return (
    <div role="tablist" aria-orientation="horizontal" className="flex items-center justify-start gap-2">
      {items.map((it, idx) => (
        <button
          key={it.key}
          role="tab"
          aria-selected={activeKey === it.key}
          aria-controls={`tabpanel-${it.key}`}
          id={`tab-${it.key}`}
          tabIndex={activeKey === it.key ? 0 : -1}
          ref={el => { refs.current[idx] = el }}
          onKeyDown={(e) => onKeyDown(e, idx)}
          onClick={() => onChange(it.key)}
          className={`px-3 rounded-t-lg py-2 -mb-px border-b-2 ${activeKey === it.key ? 'border-sky-600 bg-sky-600 text-white' : 'border-transparent bg-gray-100 text-gray-700'}`}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

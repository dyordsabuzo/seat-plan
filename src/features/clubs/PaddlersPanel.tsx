import React, { useEffect, useRef, useState } from 'react'
import DataTable, { Column } from '../../components/basic/DataTable'
import AddPaddlerForm from '../../components/complex/forms/AddPaddlerForm'
import { Club } from '../../hooks/useClubs'
import { Paddler } from '../../types/RegattaType'

type Props = {
  selectedClub: Club | null
  selectedPaddlers: string[]
  onSelectionChange: (s: string[]) => void
  showAddPaddler: boolean
  onShowAddPaddler: (v: boolean) => void
  onAddPaddler: (clubId: string, p: Omit<Paddler, 'id'>) => void
  onSavePaddler: (clubId: string, p: Paddler) => Promise<void>
  onDeletePaddler: (clubId: string, id: string) => Promise<void>
  onExportJSON: () => void
  onExportCSV: () => void
  onImportFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDeleteClub: (id: string) => void
  columns: Column<Paddler>[]
}

export default function PaddlersPanel({
  selectedClub,
  selectedPaddlers,
  onSelectionChange,
  showAddPaddler,
  onShowAddPaddler,
  onAddPaddler,
  onSavePaddler,
  onDeletePaddler,
  onExportJSON,
  onExportCSV,
  onImportFileChange,
  onDeleteClub,
  columns,
}: Props) {
  if (!selectedClub) {
    return <div className="text-center py-12 text-gray-500">Select a club from the left to view and manage members.</div>
  }

  return (
    <>
      <div className="flex flex-col items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{selectedClub.name}</h3>
          <div className="text-sm text-gray-500">{selectedClub.paddlers.length} members</div>
        </div>

        {/* Full controls on md+ */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <button onClick={() => onShowAddPaddler(true)} className="px-3 py-2 bg-blue-600 text-white rounded">Add member</button>
          <button onClick={onExportJSON} className="px-3 py-2 bg-sky-500 text-white rounded">Export JSON</button>
          <button onClick={onExportCSV} className="px-3 py-2 bg-sky-500 text-white rounded">Export CSV</button>
          <label className="inline-flex items-center px-3 py-2 bg-gray-100 rounded cursor-pointer">
            <span>Import</span>
            <input type="file" accept=".json,.csv,application/json,text/csv" className="sr-only" onChange={onImportFileChange} />
          </label>
          <button onClick={() => onDeleteClub(selectedClub.id)} className="px-3 py-2 bg-red-600 text-white rounded">Delete club</button>
        </div>

        {/* Condensed menu on small screens (aligned right) */}
        <div className="md:hidden flex justify-end w-full">
          <SmallControlsMenu
            onAdd={() => onShowAddPaddler(true)}
            onExportJSON={onExportJSON}
            onExportCSV={onExportCSV}
            onImport={(e) => onImportFileChange(e)}
            onDelete={() => onDeleteClub(selectedClub.id)}
          />
        </div>
      </div>

      {showAddPaddler && (
        <div className="mb-4">
          <AddPaddlerForm onSave={(p) => onAddPaddler(selectedClub.id, p)} onCancel={() => onShowAddPaddler(false)} />
        </div>
      )}

      <DataTable
        selectable
        selected={selectedPaddlers}
        onSelectionChange={(s) => onSelectionChange(s as string[])}
        columns={columns}
        data={selectedClub.paddlers}
        rowKey={'id'}
        onSave={(p) => onSavePaddler(selectedClub.id, p)}
        onDelete={(id) => onDeletePaddler(selectedClub.id, id)}
      />
    </>
  )
}

function SmallControlsMenu({ onAdd, onExportJSON, onExportCSV, onImport, onDelete }: { onAdd: () => void, onExportJSON: () => void, onExportCSV: () => void, onImport: (e: React.ChangeEvent<HTMLInputElement>) => void, onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const itemRefs = useRef<Array<HTMLElement | null>>([])
  const [focusIndex, setFocusIndex] = useState<number>(-1)

  useEffect(() => {
    if (!open) return undefined
    const handler = (e: MouseEvent) => {
      const el = menuRef.current
      if (!el) return
      if (!el.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [open])

  // Keyboard handling: Escape to close, Arrow navigation, Enter/Space to activate
  useEffect(() => {
    if (!open) return undefined
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        // return focus to toggle button
        setTimeout(() => btnRef.current?.focus())
        return
      }

      const items = itemRefs.current
      if (!items || items.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusIndex(i => {
          const next = Math.min(items.length - 1, Math.max(0, i + 1))
          return next === -1 ? 0 : next
        })
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusIndex(i => {
          const prev = i <= 0 ? items.length - 1 : i - 1
          return prev
        })
        return
      }

      if (e.key === 'Enter' || e.key === ' ') {
        // Activate currently focused item
        if (focusIndex >= 0 && items[focusIndex]) {
          e.preventDefault()
          ;(items[focusIndex] as HTMLElement).click()
        }
      }
    }

    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  }, [open, focusIndex])

  // Focus the first menu item when opening
  useEffect(() => {
    if (open) {
      setFocusIndex(0)
      setTimeout(() => {
        const first = itemRefs.current[0]
        if (first) (first as HTMLElement).focus()
      })
    } else {
      setFocusIndex(-1)
    }
  }, [open])

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center justify-center w-10 h-10 rounded bg-slate-100 text-slate-700"
        aria-label="Open actions"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white border rounded shadow-lg z-50">
          <div className="py-1">
            <button ref={el => { itemRefs.current[0] = el }} onClick={() => { setOpen(false); onAdd() }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50" tabIndex={0}>Add member</button>
            <button ref={el => { itemRefs.current[1] = el }} onClick={() => { setOpen(false); onExportJSON() }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50" tabIndex={0}>Export JSON</button>
            <button ref={el => { itemRefs.current[2] = el }} onClick={() => { setOpen(false); onExportCSV() }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50" tabIndex={0}>Export CSV</button>
            <button
              ref={el => { itemRefs.current[3] = el }}
              onClick={() => { fileRef.current?.click(); setOpen(false) }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
              tabIndex={0}
            >
              Import
              <input ref={fileRef} type="file" accept=".json,.csv,application/json,text/csv" className="sr-only" onChange={(e) => { onImport(e); if (fileRef.current) fileRef.current.value = '' }} />
            </button>
            <button ref={el => { itemRefs.current[4] = el }} onClick={() => { setOpen(false); onDelete() }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50" tabIndex={0}>Delete club</button>
          </div>
        </div>
      )}
    </div>
  )
}

import React from 'react'
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

        <div className="flex items-center gap-2 text-xs">
          <button onClick={() => onShowAddPaddler(true)} className="px-3 py-2 bg-blue-600 text-white rounded">Add member</button>
          <button onClick={onExportJSON} className="px-3 py-2 bg-sky-500 text-white rounded">Export JSON</button>
          <button onClick={onExportCSV} className="px-3 py-2 bg-sky-500 text-white rounded">Export CSV</button>
          <label className="inline-flex items-center px-3 py-2 bg-gray-100 rounded cursor-pointer">
            <span>Import</span>
            <input type="file" accept=".json,.csv,application/json,text/csv" className="sr-only" onChange={onImportFileChange} />
          </label>
          <button onClick={() => onDeleteClub(selectedClub.id)} className="px-3 py-2 bg-red-600 text-white rounded">Delete club</button>
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

import React, { useState } from 'react'
import { Column } from '../components/basic/DataTable'
import ConfirmModal from '../components/complex/modals/ConfirmModal'
import Tabs from '../components/ui/Tabs'
import { useAuth } from '../context/AuthContext'
import { useOptions } from '../context/OptionsContext'
import { useToast } from '../context/ToastContext'
import PaddlersPanel from '../features/clubs/PaddlersPanel'
import useClubs, { Club } from '../hooks/useClubs'
import { Paddler } from '../types/RegattaType'
import * as ClubsStorage from '../utils/ClubsStorage'
import { exportPaddlersCSV, exportPaddlersJSON, normalizePaddlers, parseCSVText } from '../utils/importExport'
import SetupHome from './SetupHome'

// type Club = {
//   id: string
//   name: string
//   paddlers: Paddler[]
// }

// const STORAGE_KEY = 'clubs'

export default function ClubsPage() {
  const {
    clubs,
    selectedClubId,
    setSelectedClubId,
    createClub,
    removeClub,
    addPaddler,
    savePaddler,
    deletePaddler,
    upsertClub,
  } = useClubs()

  const [showAddPaddler, setShowAddPaddler] = useState(false)
  const [newClubName, setNewClubName] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [selectedPaddlers, setSelectedPaddlers] = useState<string[]>([])
  const [showConfirmBulkDelete, setShowConfirmBulkDelete] = useState(false)

  const { options } = useOptions()

  const selectedClub = clubs.find(c => c.id === selectedClubId) || null

  const { user } = useAuth()
  const { addToast } = useToast()
  const prevUserRef = React.useRef<string | null>(user ? user.uid : null)
  const [showMigrationModal, setShowMigrationModal] = useState(false)

  // number of local clubs/paddlers found (for modal message)
  const [migrationInfo, setMigrationInfo] = useState<{ clubs: number; paddlers: number }>({ clubs: 0, paddlers: 0 })

  // detect sign-in transition: if user just signed in and local clubs exist, prompt migration
  React.useEffect(() => {
    const prevUid = prevUserRef.current
    const curUid = user ? user.uid : null
    // transitioned from unauthenticated to authenticated
    if (!prevUid && curUid) {
      try {
        const raw = localStorage.getItem('clubs')
        if (raw) {
          const hasMigrated = localStorage.getItem(`clubs_migrated_${curUid}`)
          const skipped = localStorage.getItem(`clubs_migration_skipped_${curUid}`)
          if (!hasMigrated && !skipped) {
            try {
              const parsed = JSON.parse(raw) as Club[]
              const clubsCount = parsed.length || 0
              const paddlersCount = parsed.reduce((acc, c) => acc + ((c.paddlers && c.paddlers.length) || 0), 0)
              setMigrationInfo({ clubs: clubsCount, paddlers: paddlersCount })
              setShowMigrationModal(true)
            } catch (e) {
              // ignore parse errors
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
    prevUserRef.current = curUid
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleConfirmMigration = async () => {
    if (!user) return
    const uid = user.uid
    const raw = localStorage.getItem('clubs')
    if (!raw) {
      setShowMigrationModal(false)
      return
    }
    try {
      const localClubs = JSON.parse(raw) as Club[]
      let migratedClubs = 0
      let migratedPaddlers = 0
      for (const lc of localClubs) {
        const remote = clubs.find(c => c.id === lc.id)
        if (remote) {
          const existingIds = new Set(remote.paddlers.map(p => String(p.id)))
          const mergedPaddlers = [...remote.paddlers]
          for (const p of lc.paddlers || []) {
            if (!existingIds.has(String(p.id))) {
              mergedPaddlers.push(p)
              migratedPaddlers++
            }
          }
          const merged = { ...remote, paddlers: mergedPaddlers }
          // persist merged club
          // eslint-disable-next-line no-await-in-loop
          await upsertClub(merged)
          migratedClubs++
        } else {
          // persist local club as-is
          // eslint-disable-next-line no-await-in-loop
          await upsertClub(lc)
          migratedClubs++
          migratedPaddlers += (lc.paddlers || []).length
        }
      }
      // mark migration done and remove local copy
      localStorage.setItem(`clubs_migrated_${uid}`, 'true')
      localStorage.removeItem('clubs')
      addToast(`Migrated ${migratedClubs} clubs and ${migratedPaddlers} paddlers to your account`, 'success')
    } catch (e: any) {
      console.debug('Migration failed', e)
      addToast(`Migration failed: ${String(e)}`, 'error')
    }
    setShowMigrationModal(false)
  }

  const handleSkipMigration = () => {
    if (!user) return
    localStorage.setItem(`clubs_migration_skipped_${user.uid}`, 'true')
    setShowMigrationModal(false)
    addToast('Migration skipped — local clubs remain on this device.', 'info')
  }

  // --- Import / Export helpers ---
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const exportJSON = () => {
    if (!selectedClub) return
    const blob = exportPaddlersJSON(selectedClub.paddlers)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedClub.name.replace(/\s+/g, '_')}_members.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    if (!selectedClub) return
    const blob = exportPaddlersCSV(selectedClub.paddlers, `${selectedClub.name.replace(/\s+/g, '_')}_members.csv`)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedClub.name.replace(/\s+/g, '_')}_members.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

//   const triggerImportClick = () => fileInputRef.current?.click()

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    if (!file || !selectedClub) return
    const reader = new FileReader()
    reader.onload = async () => {
      const text = String(reader.result || '')
      // Try JSON first
      try {
        const parsed = JSON.parse(text)
        if (Array.isArray(parsed)) {
          const normalized = normalizePaddlers(parsed)
          // Persist each imported paddler using the shared hook utilities.
          // Existing paddlers (with id) => savePaddler, new paddlers => addPaddler
          if (selectedClub) {
            try {
              // Merge normalized paddlers into the existing paddler list, then upsert once
              const existing = [...selectedClub.paddlers]

              // determine next numeric id
              let nums = existing.map(pp => {
                const m = String(pp.id).match(/(\d+)$/)
                return m ? parseInt(m[1], 10) : NaN
              }).filter(n => !Number.isNaN(n))
              let nextNum = nums.length ? Math.max(...nums) + 1 : 1

              for (const p of normalized) {
                if (p.id) {
                  const idx = existing.findIndex(ep => String(ep.id) === String(p.id))
                  if (idx >= 0) {
                    existing[idx] = { ...existing[idx], ...p }
                  } else {
                    existing.push({ ...p, id: String(p.id) })
                  }
                } else {
                  const assigned = String(nextNum++)
                  existing.push({ ...p, id: assigned })
                }
              }

              const merged = { ...selectedClub, paddlers: existing }
              // try hook upsert first (keeps local state in-sync)
              try {
                await upsertClub(merged)
                console.debug('[ClubsPage] upsertClub (hook) returned for', merged.id)
              } catch (e) {
                console.debug('[ClubsPage] upsertClub (hook) error', e)
              }

              // Also attempt a direct storage write to ensure Firestore SDK is invoked
              if (user && user.uid) {
                try {
                  console.debug('[ClubsPage] direct ClubsStorage.upsertClub', user.uid, merged.id)
                  await ClubsStorage.upsertClub(user.uid, merged)
                  console.debug('[ClubsPage] direct ClubsStorage.upsertClub done', user.uid, merged.id)
                } catch (e) {
                  console.debug('[ClubsPage] direct ClubsStorage.upsertClub error', e)
                }
              } else {
                console.debug('[ClubsPage] cannot write to Firestore - no user')
              }

              addToast(`Imported ${normalized.length} paddler(s) successfully`, 'success')
            } catch (err: any) {
              console.debug('Failed to persist imported paddlers', err)
              addToast(`Import failed: ${String(err)}`, 'error')
            }
          }
          return
        }
      } catch (jsonErr) {
        // not json, try CSV below
      }

      // CSV parsing (very simple)
      const rows = parseCSVText(text)

      // Persist parsed CSV rows via the shared hook utilities
      if (selectedClub) {
        try {
          const existing = [...selectedClub.paddlers]
          let nums = existing.map(pp => {
            const m = String(pp.id).match(/(\d+)$/)
            return m ? parseInt(m[1], 10) : NaN
          }).filter(n => !Number.isNaN(n))
          let nextNum = nums.length ? Math.max(...nums) + 1 : 1

          const normalized = normalizePaddlers(rows)
          for (const p of normalized) {
            if (p.id) {
              const idx = existing.findIndex(ep => String(ep.id) === String(p.id))
              if (idx >= 0) existing[idx] = { ...existing[idx], ...p }
              else existing.push({ ...p, id: String(p.id) })
            } else {
              const assigned = String(nextNum++)
              existing.push({ ...p, id: assigned })
            }
          }

          const merged = { ...selectedClub, paddlers: existing }
          await upsertClub(merged)
          addToast(`Imported ${normalized.length} paddler(s) successfully`, 'success')
        } catch (err: any) {
          console.debug('Failed to persist imported paddlers', err)
          addToast(`Import failed: ${String(err)}`, 'error')
        }
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const columns: Column<Paddler>[] = [
    { key: 'id', title: 'ID', sortable: true, filterable: false, frozen: true },
    { key: 'name', title: 'Name', editable: false, inputType: 'text', sortable: true, filterable: false, frozen: true },
    { key: 'gender', title: 'Gender', editable: true, inputType: 'select', 
                                options: options.genders.map(gender => ({ value: gender, label: gender })), sortable: true, filterable: false},
    { key: 'weight', title: 'Weight (kg)', editable: true, inputType: 'number', sortable: true, filterable: false },
    { key: 'preferredSide', title: 'Preferred Side', editable: true, inputType: 'select', 
                                options: options.preferredSides.map(side => ({ value: side, label: side })), sortable: true, filterable: false},
    { key: 'category', title: 'Category', editable: true, inputType: 'select', 
                                options: options.categories.map(category => ({ value: category, label: category })), sortable: true, filterable: false},
  ]

  const [activeTab, setActiveTab] = useState<'regatta' | 'paddlers'>('regatta')

//   logger.debug("Rendering ClubsPage with state", { clubs, selectedClubId, activeTab })

  return (
    <div className="p-1 sm:p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Clubs</h2>
          <p className="text-sm text-gray-500">Create and manage your clubs and their paddlers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <aside className="md:col-span-1 bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <input
              value={newClubName}
              onChange={e => setNewClubName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { createClub(newClubName); setNewClubName('') } }}
              placeholder="New club name"
              className="flex-1 border rounded px-3 py-2 text-sm"
              aria-label="New club name"
            />
            <button onClick={() => { createClub(newClubName); setNewClubName('') }} className="px-3 py-2 bg-green-600 text-white rounded text-sm">Create</button>
          </div>

          <div className="mb-2 text-xs text-gray-500">Clubs</div>
          <div className="space-y-2 max-h-[48vh] overflow-auto">
            {clubs.length === 0 && <div className="text-sm text-gray-500">No clubs yet. Create one to get started.</div>}
            {clubs.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedClubId(c.id)}
                className={`w-full text-left px-3 py-2 rounded border ${selectedClubId === c.id ? 'bg-sky-50 border-sky-300' : 'bg-white'} hover:bg-sky-50`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.paddlers.length} members</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="md:col-span-2 bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Tabs
              items={[{ key: 'regatta', label: 'Regatta' }, { key: 'paddlers', label: 'Paddlers' }]}
              activeKey={activeTab}
              onChange={(k) => setActiveTab(k as 'regatta' | 'paddlers')}
            />
            <div className="text-sm text-gray-500">{activeTab === 'paddlers' && selectedClub ? `${selectedClub.paddlers.length} members` : ''}</div>
          </div>

          {activeTab === 'regatta' ? (
            <SetupHome clubId={selectedClubId} />
          ) : (
            <PaddlersPanel
              selectedClub={selectedClub}
              selectedPaddlers={selectedPaddlers}
              onSelectionChange={(s) => setSelectedPaddlers(s)}
              showAddPaddler={showAddPaddler}
              onShowAddPaddler={(v) => setShowAddPaddler(v)}
              onAddPaddler={addPaddler}
              onSavePaddler={savePaddler}
              onDeletePaddler={deletePaddler}
              onExportJSON={exportJSON}
              onExportCSV={exportCSV}
              onImportFileChange={handleImportFile}
              onDeleteClub={(id) => { setDeleteTarget(id); setShowConfirmDelete(true) }}
              columns={columns}
            />
          )}
        </section>
      </div>

      <ConfirmModal
        open={showConfirmDelete}
        title="Delete club"
        message="Are you sure you want to delete this club? This will remove all its members."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => deleteTarget && removeClub(deleteTarget)}
        onCancel={() => { setShowConfirmDelete(false); setDeleteTarget(null) }}
      />
      <ConfirmModal
        open={showConfirmBulkDelete}
        title="Delete selected paddlers"
        message={`Are you sure you want to delete ${selectedPaddlers.length} selected paddler(s)? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={async () => {
          if (!selectedClub) return
          for (const id of selectedPaddlers) {
            // await each delete to ensure persistence order
            // individual failures will short-circuit, but that's acceptable for now
            // (could be improved with Promise.allSettled and partial success handling)
            // eslint-disable-next-line no-await-in-loop
            await deletePaddler(selectedClub.id, id)
          }
          setSelectedPaddlers([])
          setShowConfirmBulkDelete(false)
        }}
        onCancel={() => setShowConfirmBulkDelete(false)}
      />
      <ConfirmModal
        open={showMigrationModal}
        title="Migrate local clubs to your account?"
        message={`We found ${migrationInfo.clubs} local club(s) with ${migrationInfo.paddlers} paddler(s) on this device. Would you like to migrate them to your account?`}
        confirmLabel="Migrate"
        cancelLabel="Skip"
        onConfirm={() => handleConfirmMigration()}
        onCancel={() => handleSkipMigration()}
      />
    </div>
  )
}

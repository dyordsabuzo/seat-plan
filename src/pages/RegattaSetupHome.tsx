// Renamed from SetupHome.tsx for clarity
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../common/helpers/logger';
import { useAuth } from '../context/AuthContext';
import { useRegattaState } from '../context/RegattaContext';
import { useToast } from '../context/ToastContext';
import { ActionButton, ConfirmModal, Container, CreateRegattaModal, SelectableSidebarItem, SummaryCard } from '../shared';
import { Regatta } from '../types/RegattaType';
import * as RegattasStorage from '../utils/RegattasStorage';

export default function RegattaSetupHome({clubId}:{clubId:string}) {
    const [allRegattas, setAllRegattas] = useState<Record<string, Regatta> | null>(null)
    const [selectedRegatta, setSelectedRegatta] = useState<string | null>(null)
    const [createOpen, setCreateOpen] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const { state: regatta, setState: setRegattaState, setClubId } = useRegattaState()
    const { user } = useAuth()
    const { addToast } = useToast()
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (!clubId) return
        let mounted = true

        const load = async () => {
            logger.debug("Attempting to load regatta configs from localStorage and Firestore for club", clubId)
            let local: Record<string, Regatta> = {}
            try {
                const raw = localStorage.getItem('regattaConfigs')
                local = raw ? JSON.parse(raw) : {}
            } catch (error) {
                logger.debug('Failed to parse local regattaConfigs', error)
            }

            let remote: Record<string, Regatta> = {}
            try {
                remote = await RegattasStorage.loadRegattasForClub(clubId)
            } catch (error) {
                logger.debug('Failed to load regattas from Firestore', error)
            }

            const merged: Record<string, Regatta> = { ...local, ...remote }

            if (mounted) {
                setAllRegattas(merged)
                if (regatta?.name && merged[regatta.name]) {
                    setSelectedRegatta(regatta.name)
                }
            }
        }

        load()
        return () => { mounted = false }
    }, [clubId, regatta?.name])

    const regattaNames = useMemo(() => Object.keys(allRegattas ?? {}), [allRegattas])

    const activeRegatta = useMemo(() => {
        if (selectedRegatta && allRegattas?.[selectedRegatta]) {
            return allRegattas[selectedRegatta]
        }
        if (regatta?.name && allRegattas?.[regatta.name]) {
            return allRegattas[regatta.name]
        }
        return null
    }, [allRegattas, regatta, selectedRegatta])

    const selectedIndex = activeRegatta ? regattaNames.indexOf(activeRegatta.name) : -1

    const persistLocalRegattas = (nextRegattas: Record<string, Regatta>) => {
        localStorage.setItem('regattaConfigs', JSON.stringify(nextRegattas))
    }

    const syncContext = (nextRegatta: Regatta | null) => {
        setClubId(clubId || null)
        setRegattaState(nextRegatta)
    }

    const handleSelect = (regattaName: string) => {
        const picked = allRegattas?.[regattaName] || { name: regattaName, paddlers: [], races: [] }
        logger.debug('Selected regatta', regattaName, picked)
        setSelectedRegatta(regattaName)
        syncContext(picked)
    }

    const handleCreate = async (name: string) => {
        const newRegatta: Regatta = { name, paddlers: [], races: [] }
        const nextRegattas = { ...(allRegattas ?? {}), [name]: newRegatta }

        setAllRegattas(nextRegattas)
        setSelectedRegatta(name)
        syncContext(newRegatta)
        persistLocalRegattas(nextRegattas)

        try {
            if (user?.uid) {
                await RegattasStorage.upsertRegatta(user.uid, clubId, newRegatta)
            }
            addToast(`Created regatta "${name}"`, 'success')
        } catch (error) {
            logger.debug('Failed to persist created regatta to Firestore', error)
            addToast(`Saved regatta "${name}" locally`, 'info')
        }

        navigate('/paddlers')
    }

    const triggerImportClick = () => fileInputRef.current?.click()

    const importRegattaFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            const text = await file.text()
            const parsed = JSON.parse(text)
            if (!parsed || typeof parsed !== 'object' || !parsed.name) {
                addToast('Invalid regatta JSON: missing name property', 'error')
                return
            }

            const nextRegatta: Regatta = {
                paddlers: [],
                races: [],
                ...parsed,
            }

            const nextRegattas = { ...(allRegattas ?? {}), [nextRegatta.name]: nextRegatta }
            setAllRegattas(nextRegattas)
            setSelectedRegatta(nextRegatta.name)
            syncContext(nextRegatta)
            persistLocalRegattas(nextRegattas)

            if (user?.uid) {
                await RegattasStorage.upsertRegatta(user.uid, clubId, nextRegatta)
            }

            addToast(`Imported regatta "${nextRegatta.name}"`, 'success')
        } catch (error) {
            logger.debug('Failed to import regatta file', error)
            addToast('Failed to import regatta JSON', 'error')
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const exportRegattaAsJson = () => {
        if (!activeRegatta) {
            addToast('No regatta selected to export', 'error')
            return
        }

        try {
            const json = JSON.stringify(activeRegatta, null, 2)
            const blob = new Blob([json], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            const safeName = activeRegatta.name.replace(/\s+/g, '_')
            anchor.href = url
            anchor.download = `${safeName}.json`
            document.body.appendChild(anchor)
            anchor.click()
            anchor.remove()
            URL.revokeObjectURL(url)
        } catch (error) {
            logger.debug('Failed to export regatta', error)
            addToast('Failed to export regatta', 'error')
        }
    }

    const confirmDeleteRegatta = async () => {
        if (!activeRegatta) return

        const nextRegattas = { ...(allRegattas ?? {}) }
        delete nextRegattas[activeRegatta.name]

        setAllRegattas(nextRegattas)
        setSelectedRegatta(null)
        syncContext(null)
        persistLocalRegattas(nextRegattas)
        setShowDeleteConfirm(false)

        try {
            if (user?.uid) {
                await RegattasStorage.deleteRegatta(clubId, activeRegatta.name)
            }
            addToast(`Deleted regatta "${activeRegatta.name}"`, 'success')
        } catch (error) {
            logger.debug('Failed to delete regatta from Firestore', error)
            addToast(`Deleted regatta "${activeRegatta.name}" locally`, 'info')
        }
    }

    return (
        <Container className="py-6">
            <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={importRegattaFromFile}
            />

            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Regatta configurations</h2>
                    <p className="text-sm text-gray-500">
                        Select an existing regatta or create a new one for this club.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <aside className="md:col-span-1 rounded-lg border bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                        <ActionButton
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            variant="success"
                            size="sm"
                        >
                            New
                        </ActionButton>
                        <ActionButton
                            type="button"
                            onClick={triggerImportClick}
                            variant="info"
                            size="sm"
                        >
                            Import
                        </ActionButton>
                    </div>

                    <div className="mb-2 text-xs text-gray-500">Saved regattas</div>
                    <div className="max-h-[48vh] space-y-2 overflow-auto">
                        {regattaNames.length === 0 && (
                            <div className="text-sm text-gray-500">No regattas yet. Create one to get started.</div>
                        )}
                        {regattaNames.map((name) => {
                            const item = allRegattas?.[name]
                            const isSelected = selectedIndex >= 0 && activeRegatta?.name === name

                            return (
                                <SelectableSidebarItem
                                    key={name}
                                    onClick={() => handleSelect(name)}
                                    selected={isSelected}
                                    title={name}
                                    subtitle={`${item?.races?.length ?? 0} races • ${item?.paddlers?.length ?? 0} paddlers`}
                                />
                            )
                        })}
                    </div>
                </aside>

                <section className="md:col-span-2 rounded-lg border bg-white p-4 shadow-sm">
                    {activeRegatta ? (
                        <>
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{activeRegatta.name}</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage races, paddlers, and seating plans for this regatta.
                                    </p>
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                    <div>{activeRegatta.races?.length ?? 0} races</div>
                                    <div>{activeRegatta.paddlers?.length ?? 0} paddlers</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <ActionButton
                                    type="button"
                                    onClick={() => navigate('/manage')}
                                    variant="success"
                                    size="sm"
                                >
                                    Manage races
                                </ActionButton>
                                <ActionButton
                                    type="button"
                                    onClick={() => navigate('/setupboard')}
                                    variant="success"
                                    size="sm"
                                >
                                    Setup boat config
                                </ActionButton>
                                <ActionButton
                                    type="button"
                                    onClick={() => navigate('/paddlers')}
                                    variant="accent"
                                    size="sm"
                                >
                                    Edit paddlers
                                </ActionButton>
                                <ActionButton
                                    type="button"
                                    onClick={exportRegattaAsJson}
                                    variant="primary"
                                    size="sm"
                                >
                                    Export configuration
                                </ActionButton>
                                <ActionButton
                                    type="button"
                                    onClick={() => navigate('/allconfigs')}
                                    variant="primary"
                                    size="sm"
                                >
                                    View all configs
                                </ActionButton>
                                <ActionButton
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    variant="danger"
                                    size="sm"
                                >
                                    Delete configuration
                                </ActionButton>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <SummaryCard label="Races" value={activeRegatta.races?.length ?? 0} />
                                <SummaryCard label="Paddlers" value={activeRegatta.paddlers?.length ?? 0} />
                                <SummaryCard
                                    label="Club"
                                    value={clubId || 'No club selected'}
                                    valueClassName="truncate text-sm font-medium text-slate-800"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="py-6">
                            <h3 className="text-lg font-semibold">No regatta selected</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Choose a saved regatta, import one from JSON, or create a new configuration.
                            </p>
                            <div className="mt-4 flex gap-2">
                                <ActionButton
                                    type="button"
                                    onClick={() => setCreateOpen(true)}
                                    variant="success"
                                    size="sm"
                                >
                                    Create regatta
                                </ActionButton>
                                <ActionButton
                                    type="button"
                                    onClick={triggerImportClick}
                                    variant="info"
                                    size="sm"
                                >
                                    Import JSON
                                </ActionButton>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <CreateRegattaModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
            <ConfirmModal
                open={showDeleteConfirm}
                title="Delete regatta"
                message={`Delete ${activeRegatta?.name ?? 'this regatta'}? This cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={confirmDeleteRegatta}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </Container>
    )
}

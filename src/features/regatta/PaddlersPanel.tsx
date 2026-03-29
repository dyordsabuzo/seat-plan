import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { logger } from '../../common/helpers/logger'
import DataTable, { Column } from '../../components/basic/DataTable'
import { useOptions } from '../../context/OptionsContext'
import { useRegattaState } from '../../context/RegattaContext'
import useClubs from '../../hooks/useClubs'
import { clubPaddlersButtonClassName } from '../../shared/ui/actions'
import { Paddler, Race } from '../../types/RegattaType'
import ClubPaddlersModal from './paddlers/components/ClubPaddlersModal'
import { Paddler as ClubPaddler } from './paddlers/types'

type Props = {
    locked?: boolean
}

type RaceColumnMode = 'all' | 'focused'

const getRaceLabel = (race: Race, index: number) => {
    const parts = [race.category, race.type, race.distance, race.boatType]
        .filter((value) => Boolean(value))
        .map((value) => String(value));

    return parts.length ? parts.join(' • ') : `Race ${index + 1}`;
}

const PaddlersPanel: React.FC<Props> = ({ locked = false }) => {
    const { state: regatta, setState: setRegatta, clubId } = useRegattaState()
    const { options } = useOptions()
    const { clubs } = useClubs()
    const races = useMemo<Race[]>(() => regatta?.races || [], [regatta?.races])
    const [clubModalOpen, setClubModalOpen] = useState(false)
    const [clubPaddlers, setClubPaddlers] = useState<ClubPaddler[]>([])
    const [clubSelectedIds, setClubSelectedIds] = useState<string[]>([])
    const [clubSearch, setClubSearch] = useState('')
    const [clubLoading, setClubLoading] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)
    const [actionSuccess, setActionSuccess] = useState<string | null>(null)
    const [raceColumnMode, setRaceColumnMode] = useState<RaceColumnMode>('all')
    const [focusedRaceId, setFocusedRaceId] = useState<string>('')
    const [raceSearch, setRaceSearch] = useState('')

    const filtered = useMemo<Paddler[]>(() => regatta?.paddlers || [], [regatta?.paddlers])

    const availableClubPaddlers = useMemo(() => {
        const existingIds = new Set((filtered || []).map((item) => String(item.id)))
        return (clubPaddlers || []).filter((p) => !existingIds.has(String(p.id)))
    }, [clubPaddlers, filtered])

    const filteredClubPaddlers = useMemo(() => {
        if (!clubSearch) return availableClubPaddlers
        const query = clubSearch.toLowerCase()
        return availableClubPaddlers.filter((p) => `${p.name} ${p.id}`.toLowerCase().includes(query))
    }, [availableClubPaddlers, clubSearch])

    useEffect(() => {
        if (!locked) return
        setClubModalOpen(false)
    }, [locked])

    useEffect(() => {
        if (!races.length) {
            setFocusedRaceId('')
            return
        }

        if (!focusedRaceId || !races.some((race) => race.id === focusedRaceId)) {
            setFocusedRaceId(races[0].id)
        }
    }, [races, focusedRaceId])

    const raceFilter = raceSearch.trim().toLowerCase()

    const visibleRaces = useMemo(() => {
        const base = raceColumnMode === 'focused'
            ? races.filter((race) => race.id === focusedRaceId)
            : races

        if (!raceFilter) return base

        return base.filter((race, index) => getRaceLabel(race, index).toLowerCase().includes(raceFilter))
    }, [raceColumnMode, races, focusedRaceId, raceFilter])

    const focusedRace = useMemo(
        () => races.find((race) => race.id === focusedRaceId) || null,
        [races, focusedRaceId],
    )

    const handleSave = useCallback((row: Paddler) => {
        if (locked) return
        const nextPaddlers = (regatta?.paddlers || []).map(p => p.id === row.id ? {...p, ...row} : p)
        const nextRaces = races.map(r => ({...r, paddlers: (r.paddlers || []).map((p: Paddler) => p.id === row.id ? {...p, ...row} : p)}))
        setRegatta(prev => ({...prev, paddlers: nextPaddlers, races: nextRaces}))
    }, [locked, regatta?.paddlers, races, setRegatta])

    const deletePaddler = useCallback((id: string) => {
        if (locked) return
        const remaining = (regatta?.paddlers || []).filter(p => p.id !== id)
        const nextRaces = races.map(r => ({...r, paddlers: (r.paddlers || []).filter((p: Paddler) => p.id !== id)}))
        setRegatta(prev => ({...prev, paddlers: remaining, races: nextRaces}))
    }, [locked, regatta?.paddlers, races, setRegatta])

    const toggleAllocation = useCallback((paddlerId: string, raceId: string, checked: boolean) => {
        if (locked) return
        const nextRaces = races.map(r => {
            if (r.id !== raceId) return r
            const existing = r.paddlers || []
            if (checked) {
                const p = (regatta?.paddlers || []).find(pp => pp.id === paddlerId)
                if (!p) return r
                if (existing.find((e: Paddler) => e.id === paddlerId)) return r
                return {...r, paddlers: [...existing, p]}
            } else {
                return {...r, paddlers: existing.filter((e: Paddler) => e.id !== paddlerId)}
            }
        })
        logger.debug('Toggling allocation for paddler', paddlerId, nextRaces)
        setRegatta(prev => ({...prev, races: nextRaces}))
    }, [locked, races, regatta?.paddlers, setRegatta])

    const openClubPaddlersModal = async () => {
        setActionError(null)
        setActionSuccess(null)

        if (locked) {
            setActionError('Regatta management is locked. Unlock to modify paddlers.')
            return
        }

        if (!clubId) {
            setActionError('No club selected. Please select a club first.')
            return
        }

        setClubLoading(true)
        try {
            const selectedClub = clubs.find((club) => String(club.id) === String(clubId))
            const list = (selectedClub?.paddlers || []).map((p: any) => ({
                id: String(p.id),
                name: p.name || '',
                weight: p.weight,
                gender: p.gender,
                birthdate: p.birthdate || null,
            }))

            setClubPaddlers(list)
            setClubSelectedIds([])
            setClubSearch('')
            setClubModalOpen(true)
        } catch (error) {
            logger.debug('Failed to load club paddlers', error)
            setActionError('Failed to load club paddlers')
        } finally {
            setClubLoading(false)
        }
    }

    const toggleClubPaddler = (id: string) => {
        setClubSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
    }

    const addSelectedClubPaddlers = () => {
        const selected = clubPaddlers.filter((p) => clubSelectedIds.includes(String(p.id)))
        if (!selected.length) {
            setActionError('Please select at least one paddler')
            return
        }

        const existing = Array.isArray(regatta?.paddlers) ? regatta.paddlers : []
        const nextMap = new Map(existing.map((p) => [String(p.id), p]))
        selected.forEach((p) => {
            if (!nextMap.has(String(p.id))) {
                nextMap.set(String(p.id), p as Paddler)
            }
        })

        const nextPaddlers = Array.from(nextMap.values())
        setRegatta((prev) => ({ ...prev, paddlers: nextPaddlers }))
        setClubModalOpen(false)
        setActionError(null)
        setActionSuccess(`${selected.length} paddler(s) added from club`)
    }

    const applyFocusedRaceAllocation = useCallback((assignAll: boolean) => {
        if (locked) {
            setActionError('Regatta management is locked. Unlock to modify allocations.')
            return
        }

        if (!focusedRaceId) {
            setActionError('Please select a focused race first.')
            return
        }

        const sourcePaddlers = Array.isArray(regatta?.paddlers) ? regatta.paddlers : []
        const sourceById = new Map(sourcePaddlers.map((p) => [String(p.id), p]))
        const nextRaces = races.map((race) => {
            if (race.id !== focusedRaceId) return race

            if (!assignAll) {
                return { ...race, paddlers: [] }
            }

            const nextPaddlers = sourcePaddlers
                .map((p) => sourceById.get(String(p.id)) || p)
                .filter(Boolean)

            return { ...race, paddlers: nextPaddlers }
        })

        setRegatta((prev) => ({ ...prev, races: nextRaces }))
        setActionError(null)
        setActionSuccess(assignAll ? 'Allocated all paddlers to focused race.' : 'Cleared all paddlers from focused race.')
    }, [focusedRaceId, locked, races, regatta?.paddlers, setRegatta])

    const baseColumns = useMemo(() => (
        [
            {key: 'id', title: 'ID', sortable: true, filterable: false, frozen: true},
            {key: 'name', title: 'Name', editable: false, inputType: 'text', sortable: true, filterable: false, frozen: true},
            {key: 'gender', title: 'Gender', editable: true, inputType: 'select', options: options.genders.map(gender => ({ value: gender, label: gender })), sortable: true, filterable: false},
            {key: 'weight', title: 'Weight (kg)', editable: true, inputType: 'number', sortable: true, filterable: false, showOnEditOnly: true},
            {key: 'preferredSide', title: 'Preferred Side', editable: true, inputType: 'select', options: options.preferredSides.map(side => ({ value: side, label: side })), sortable: true, filterable: false},
            {key: 'birthdate', title: 'DOB', hideOnEdit: true, editable: false, inputType: 'date', sortable: true, filterable: false, showOnEditOnly: true},
        ] as Column<Paddler>[]
    ), [options.genders, options.preferredSides])

    const raceAllocationColumns = useMemo(() => (
        visibleRaces.map((race) => ({
            key: `race_${race.id}`,
            title: getRaceLabel(race, races.findIndex((item) => item.id === race.id)),
            hideOnEdit: true,
            render: (row: Paddler) => {
                const allocated = (race.paddlers || []).some((p) => p.id === row.id)
                return (
                    <input
                        type="checkbox"
                        checked={allocated}
                        disabled={locked}
                        aria-label={`Allocate ${row.name} to ${getRaceLabel(race, races.findIndex((item) => item.id === race.id))}`}
                        onChange={(event) => toggleAllocation(row.id, race.id, event.target.checked)}
                    />
                )
            },
        }) as Column<Paddler>)
    ), [locked, races, toggleAllocation, visibleRaces])

    const summaryColumn = useMemo(() => ({
        key: 'totalRaces',
        title: 'Total Races',
        hideOnEdit: true,
        render: (row: Paddler) => {
            const count = races.reduce((acc, race) => acc + ((race.paddlers || []).some((p: Paddler) => p.id === row.id) ? 1 : 0), 0)
            return (<span className={`text-sm`}>{count}</span>)
        }
    } as Column<Paddler>), [races])

    const columns = useMemo(
        () => [...baseColumns, ...raceAllocationColumns, summaryColumn],
        [baseColumns, raceAllocationColumns, summaryColumn],
    )

    return (
        <div>
            <div className={`mb-2 flex items-center justify-between`}> 
                <div>
                    <h1 className={`text-base text-gray-700`}>Race allocations</h1>
                    <p className={`text-xs text-gray-400`}>Manage race allocations</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={openClubPaddlersModal}
                        disabled={clubLoading || locked}
                        className={clubPaddlersButtonClassName}
                    >
                        Club paddlers
                    </button>
                </div>
            </div>

            <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="text-xs font-medium text-slate-700">Race column view</div>
                    <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5">
                        <button
                            type="button"
                            onClick={() => setRaceColumnMode('all')}
                            className={`rounded px-2 py-1 text-xs ${raceColumnMode === 'all' ? 'bg-sky-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                            All races ({races.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setRaceColumnMode('focused')}
                            className={`rounded px-2 py-1 text-xs ${raceColumnMode === 'focused' ? 'bg-sky-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                            Focus one race
                        </button>
                    </div>

                    {raceColumnMode === 'focused' && (
                        <>
                            <select
                                value={focusedRaceId}
                                onChange={(event) => setFocusedRaceId(event.target.value)}
                                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                            >
                                {races.map((race, index) => (
                                    <option key={race.id} value={race.id}>
                                        {getRaceLabel(race, index)}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={() => applyFocusedRaceAllocation(true)}
                                disabled={locked || !focusedRaceId}
                                className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Allocate all paddlers
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFocusedRaceAllocation(false)}
                                disabled={locked || !focusedRaceId}
                                className="rounded bg-slate-500 px-2 py-1 text-xs font-medium text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Clear focused race
                            </button>
                        </>
                    )}

                    <input
                        value={raceSearch}
                        onChange={(event) => setRaceSearch(event.target.value)}
                        placeholder="Filter race columns"
                        className="min-w-[180px] rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                    />

                    <div className="text-xs text-slate-500">
                        Showing {visibleRaces.length} of {races.length} race column(s)
                        {raceColumnMode === 'focused' && focusedRace ? ` • ${getRaceLabel(focusedRace, races.findIndex((item) => item.id === focusedRace.id))}` : ''}
                    </div>
                </div>
            </div>

            {(actionError || actionSuccess) && (
                <div className="mb-2 mt-1 flex items-center gap-3 text-sm">
                    {actionError && <span className="text-red-600">{actionError}</span>}
                    {actionSuccess && <span className="text-green-600">{actionSuccess}</span>}
                </div>
            )}

            {races.length > 0 && (
                <div className="mb-2 text-xs text-slate-500">
                    Tip: Use horizontal scroll for race columns, or switch to focused mode for quicker allocations.
                </div>
            )}

            <DataTable
                key={'paddlers'}
                data={filtered}
                rowKey={'id'}
                columns={columns}
                onSave={handleSave}
                onDelete={deletePaddler}
                noEdit={locked}
                noDelete={locked}
                stickyHeader
                maxHeight="max-h-[68vh]"
            />

            <ClubPaddlersModal
                open={clubModalOpen}
                search={clubSearch}
                setSearch={setClubSearch}
                selectedIds={clubSelectedIds}
                paddlers={filteredClubPaddlers}
                availableCount={availableClubPaddlers.length}
                onToggle={toggleClubPaddler}
                onClose={() => setClubModalOpen(false)}
                onAddSelected={addSelectedClubPaddlers}
            />
        </div>
    )
}

export default PaddlersPanel

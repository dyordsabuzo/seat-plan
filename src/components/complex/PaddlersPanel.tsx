import React, { useState } from 'react'
import { logger } from '../../common/helpers/logger'
import { useOptions } from '../../context/OptionsContext'
import { useRegattaState } from '../../context/RegattaContext'
import { Paddler, Race } from '../../types/RegattaType'
import DataTable, { Column } from '../basic/DataTable'
import AddPaddlerForm from './forms/AddPaddlerForm'

const PaddlersPanel: React.FC = () => {
    const { state: regatta, setState: setRegatta } = useRegattaState()
    const { options } = useOptions()
    const [showAddPaddler, setShowAddPaddler] = useState(false)

    const filtered: Paddler[] = regatta?.paddlers || []

    const getRacePaddlerIds = (race: Race): string[] => {
        if (Array.isArray(race.paddlerIds) && race.paddlerIds.length > 0) {
            return race.paddlerIds.map((id) => String(id))
        }
        if (!Array.isArray(race.paddlers)) return []
        return race.paddlers.map((p) => String(p.id))
    }

    const handleSave = (row: Paddler) => {
        const nextPaddlers = (regatta.paddlers || []).map(p => p.id === row.id ? {...p, ...row} : p)
        setRegatta(prev => ({...prev, paddlers: nextPaddlers}))
    }

    const deletePaddler = (id: string) => {
        const remaining = (regatta.paddlers || []).filter(p => p.id !== id)
        setRegatta(prev => ({...prev, paddlers: remaining}))
    }

    const toggleAllocation = (paddlerId: string, raceId: string, checked: boolean) => {
        const nextRaces = (regatta.races || []).map(r => {
            if (r.id !== raceId) return r
            const existingIds = new Set(getRacePaddlerIds(r))
            if (checked) {
                const p = (regatta.paddlers || []).find(pp => pp.id === paddlerId)
                if (!p) return r
                if (existingIds.has(String(paddlerId))) return r
                return {...r, paddlerIds: [...Array.from(existingIds), String(paddlerId)]}
            } else {
                return {...r, paddlerIds: Array.from(existingIds).filter((id) => id !== String(paddlerId))}
            }
        })
        logger.debug("Toggling allocation for paddler", paddlerId, nextRaces)
        setRegatta(prev => ({...prev, races: nextRaces}))
    }

    return (
        <div>
            <div className={`mb-2 flex items-center justify-between`}> 
                <div>
                    <h1 className={`text-base text-gray-700`}>Race allocations</h1>
                    <p className={`text-xs text-gray-400`}>Manage race allocations</p>
                </div>
                <div className="flex items-center gap-2">
                    {!showAddPaddler && (
                        <button onClick={() => setShowAddPaddler(true)} className={`px-2 py-1 bg-blue-500 text-white rounded`}>Add paddler</button>
                    )}
                    {showAddPaddler && (
                        <AddPaddlerForm
                            onSave={(createdNoId) => {
                                // compute next numeric id from existing paddlers
                                const nextId = (() => {
                                    try {
                                        const nums = (regatta.paddlers || []).map(p => {
                                            const m = String(p.id).match(/(\d+)$/)
                                            return m ? parseInt(m[1], 10) : NaN
                                        }).filter(n => !Number.isNaN(n))
                                        const max = nums.length ? Math.max(...nums) : 0
                                        return String(max + 1)
                                    } catch (e) {
                                        return String(Date.now())
                                    }
                                })()

                                const created = { id: nextId, ...createdNoId }
                                const nextP = Array.isArray(regatta.paddlers) ? [...regatta.paddlers, created] : [created]
                                setRegatta(prev => ({...prev, paddlers: nextP}))
                                // allow AddPaddlerForm to animate out, it will call onCancel after transition end
                            }}
                            onCancel={() => setShowAddPaddler(false)}
                        />
                    )}
                </div>
            </div>
            <DataTable
                key={"paddlers"}
                data={filtered}
                rowKey={'id'}
                columns={
                    ([
                            {key: 'id', title: 'ID', sortable: true, filterable: false, frozen: true},
                            {key: 'name', title: 'Name', editable: false, inputType: 'text', sortable: true, filterable: false, frozen: true},
                            {key: 'gender', title: 'Gender', editable: true, inputType: 'select', 
                                options: options.genders.map(gender => ({ value: gender, label: gender })), sortable: true, filterable: false},
                            {key: 'weight', title: 'Weight (kg)', editable: true, inputType: 'number', sortable: true, filterable: false, showOnEditOnly: true},
                            {key: 'preferredSide', title: 'Preferred Side', editable: true, inputType: 'select', 
                                options: options.preferredSides.map(side => ({ value: side, label: side })), sortable: true, filterable: false},
                            {key: 'birthdate', title: 'DOB', hideOnEdit: true, editable: false, inputType: 'date', sortable: true, filterable: false, showOnEditOnly: true},
                        ] as Column<Paddler>[])
                    .concat((regatta.races || []).map((race: Race) => ({
                        key: `race_${race.id}`,
                        title: `${race.category}-${race.type}-${race.distance}-${race.boatType}`,
                        hideOnEdit: true, 
                        render: (row: Paddler) => {
                            const allocated = getRacePaddlerIds(race).includes(String(row.id))
                            return (
                                <input type="checkbox" checked={allocated} onChange={(e) => toggleAllocation(row.id, race.id, e.target.checked)} />
                            )
                        }
                    }) as Column<Paddler>))
                    .concat({key: 'totalRaces', title: 'Total Races', hideOnEdit: true, render: (row: Paddler) => {
                        const count = (regatta.races || []).reduce((acc, r) => acc + (getRacePaddlerIds(r).includes(String(row.id)) ? 1 : 0), 0)
                        return (<span className={`text-sm`}>{count}</span>)
                    }})
                }
                onSave={handleSave}
                onDelete={deletePaddler}
            />
        </div>
    )
}

export default PaddlersPanel

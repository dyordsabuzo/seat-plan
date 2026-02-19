import React, { useState } from 'react'
import { useRegattaState } from '../../context/RegattaContext'
import { Paddler, Race } from '../../types/RegattaType'
import DataTable, { Column } from '../basic/DataTable'
import AddPaddlerForm from './forms/AddPaddlerForm'

const PaddlersPanel: React.FC = () => {
    const { state: regatta, setState: setRegatta } = useRegattaState()
    const [showAddPaddler, setShowAddPaddler] = useState(false)

    const filtered: Paddler[] = regatta?.paddlers || []

    const handleSave = (row: Paddler) => {
        const nextPaddlers = (regatta.paddlers || []).map(p => p.id === row.id ? {...p, ...row} : p)
        const nextRaces = (regatta.races || []).map(r => ({...r, paddlers: (r.paddlers || []).map((p: Paddler) => p.id === row.id ? {...p, ...row} : p)}))
        setRegatta(prev => ({...prev, paddlers: nextPaddlers, races: nextRaces}))
    }

    const deletePaddler = (id: string) => {
        const remaining = (regatta.paddlers || []).filter(p => p.id !== id)
        const nextRaces = (regatta.races || []).map(r => ({...r, paddlers: (r.paddlers || []).filter((p: Paddler) => p.id !== id)}))
        setRegatta(prev => ({...prev, paddlers: remaining, races: nextRaces}))
    }

    const toggleAllocation = (paddlerId: string, raceId: string, checked: boolean) => {
        const nextRaces = (regatta.races || []).map(r => {
            if (r.id !== raceId) return r
            const existing = r.paddlers || []
            if (checked) {
                const p = (regatta.paddlers || []).find(pp => pp.id === paddlerId)
                if (!p) return r
                if (existing.find((e: Paddler) => e.id === paddlerId)) return r
                return {...r, paddlers: [...existing, p]}
            } else {
                return {...r, paddlers: existing.filter((e: Paddler) => e.id !== paddlerId)}
            }
        })
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
                        {key: 'id', title: 'ID', sortable: true, filterable: false},
                        {key: 'name', title: 'Name', editable: true, inputType: 'text', sortable: true, filterable: false},
                        {key: 'gender', title: 'Gender', editable: true, inputType: 'select', options: [{value: 'M', label: 'M'}, {value: 'F', label: 'F'}, {value: 'O', label: 'Other'}], sortable: true, filterable: false},
                    ] as Column<Paddler>[])
                    .concat((regatta.races || []).map((race: Race) => ({
                        key: `race_${race.id}`,
                        title: `${race.category}-${race.type}-${race.distance}-${race.boatType}`,
                        render: (row: Paddler) => {
                            const allocated = (race.paddlers || []).some(p => p.id === row.id)
                            return (
                                <input type="checkbox" checked={allocated} onChange={(e) => toggleAllocation(row.id, race.id, e.target.checked)} />
                            )
                        }
                    }) as Column<Paddler>))
                    .concat({key: 'totalRaces', title: 'Total Races', render: (row: Paddler) => {
                        const count = (regatta.races || []).reduce((acc, r) => acc + ((r.paddlers || []).some((p: Paddler) => p.id === row.id) ? 1 : 0), 0)
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

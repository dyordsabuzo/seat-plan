import React, { useState } from 'react'
import { useOptions } from '../../context/OptionsContext'
import { useRegattaState } from '../../context/RegattaContext'
import { Race } from '../../types/RegattaType'
import DataTable, { Column } from '../basic/DataTable'
import AddRaceForm from './forms/AddRaceForm'

const RacesPanel: React.FC = () => {
    const { state: regatta, setState: setRegatta } = useRegattaState()
    const [showAddRace, setShowAddRace] = useState(false)
    const { addOption } = useOptions()

    const races: Race[] = regatta?.races || []

    const handleSaveRace = (row: Race) => {
        const next = races.map(r => r.id === row.id ? {...r, ...row} : r)
        setRegatta(prev => ({...prev, races: next}))
    }

    const deleteRace = (id: string) => {
        const remaining = races.filter(r => r.id !== id)
        setRegatta(prev => ({...prev, races: remaining}))
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className={`mb-2`}>
                    <h1 className={`text-base text-gray-700`}>Races</h1>
                    <p className={`text-xs text-gray-400`}>Manage races</p>
                </div>
                <div className="flex items-center gap-2">
                    {!showAddRace && (
                        <button onClick={() => setShowAddRace(true)} className={`px-2 py-1 bg-blue-500 text-white rounded`}>Add race</button>
                    )}

                    {showAddRace && (
                        <AddRaceForm
                            onCancel={() => setShowAddRace(false)}
                            onSave={(vals) => {
                                // compute next id based on numeric suffixes in existing ids
                                const nextId = (() => {
                                    try {
                                        const nums = races.map(r => {
                                            const m = String(r.id).match(/(\d+)$/)
                                            return m ? parseInt(m[1], 10) : NaN
                                        }).filter(n => !Number.isNaN(n))
                                        const max = nums.length ? Math.max(...nums) : 0
                                        return `${max + 1}`
                                    } catch (e) {
                                        return String(Date.now())
                                    }
                                })()

                                const created: Race = {
                                    id: nextId,
                                    category: vals.category,
                                    type: vals.type,
                                    distance: vals.distance,
                                    boatType: vals.boatType,
                                    paddlers: []
                                }
                                const next = [...races, created]
                                setRegatta(prev => ({...prev, races: next}))
                                try {
                                    addOption('categories', created.category)
                                    addOption('types', created.type ?? '')
                                    addOption('distances', created.distance ?? '')
                                    addOption('boatTypes', created.boatType ?? '')
                                } catch (err) {
                                    console.debug('failed to add options', err)
                                }
                                // Do not immediately setShowAddRace(false) here —
                                // the form will call onCancel after its exit animation completes.
                            }}
                        />
                    )}
                </div>
            </div>

            <DataTable
                key={"races"}
                data={races}
                rowKey={'id'}
                columns={[
                    {key: 'id', title: 'ID', sortable: true, filterable: false},
                    {key: 'category', title: 'Category', inputType: 'text', sortable: true, filterable: false},
                    {key: 'type', title: 'Type', inputType: 'text', sortable: true, filterable: false},
                    {key: 'distance', title: 'Distance (m)', editable: true, inputType: 'text', sortable: true, filterable: false},
                    {key: 'boatType', title: 'Boat Type', editable: true, inputType: 'text', sortable: true, filterable: false}
                ] as Column<Race>[]}
                onSave={handleSaveRace}
                onDelete={deleteRace}
            />
        </div>
    )
}

export default RacesPanel

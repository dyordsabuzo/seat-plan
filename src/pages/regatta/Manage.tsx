import { useState } from "react";
import { logger } from "../../common/helpers/logger";
import Breadcrumb from "../../components/basic/Breadcrumb";
import DataTable, { Column } from "../../components/basic/DataTable";
import { useRegattaState } from "../../context/RegattaContext";
// import Tabs from "../../refactor/Tabs";
import { useNavigate } from "react-router-dom";
import { useOptions } from "../../context/OptionsContext";
import { Paddler, Race } from "../../types/RegattaType";

const Manage: React.FC = () => {
    const {state: regatta, setState: setRegatta} = useRegattaState();
    const [races, setRaces] = useState<Race[]>(regatta?.races || []);
    const [showAddRace, setShowAddRace] = useState(false)
    const [newRace, setNewRace] = useState<Partial<Race>>({category: '', type: '', distance: '', boatType: ''})
    const { options, addOption } = useOptions()
    const categoryOptions: string[] = (regatta?.categories && regatta.categories.length) ? regatta.categories : (options.categories.length ? options.categories : Array.from(new Set((races || []).map(r => r.category))).filter(Boolean))
    const typeOptions: string[] = (regatta?.types && regatta.types.length) ? regatta.types : (options.types.length ? options.types : Array.from(new Set((races || []).map(r => r.type ?? ''))).filter(Boolean))
    const distanceOptions: string[] = (regatta?.distances && regatta.distances.length) ? regatta.distances : (options.distances.length ? options.distances : Array.from(new Set((races || []).map(r => r.distance ?? ''))).filter(Boolean))
    const boatTypeOptions: string[] = (regatta?.boatTypes && regatta.boatTypes.length) ? regatta.boatTypes : (options.boatTypes.length ? options.boatTypes : Array.from(new Set((races || []).map(r => r.boatType ?? ''))).filter(Boolean))

    const navigate = useNavigate()

    const handleSaveRace = (row: Race) => {
        // update races list locally (not persisted to backend here)
        const next = races.map(r => r.id === row.id ? {...r, ...row} : r)
        setRaces(next)
        // also reflect back into regatta state
        setRegatta(prev => ({...prev, races: next}))
    }

    const deleteRace = (id: string) => {
        logger.debug("Deleting race with id", id)
        const remaining = races.filter(r => r.id !== id)
        setRaces(remaining);
        // also remove from regatta state so allocations columns update
        const nextRegattaRaces = (regatta.races || []).filter(r => r.id !== id)
        setRegatta(prev => ({...prev, races: nextRegattaRaces}))
    }

    const deletePaddler = (id: string) => {
        // remove from regatta.paddlers and from any race allocations
        const remaining = (regatta.paddlers || []).filter(p => p.id !== id)
        const nextRaces = (regatta.races || []).map(r => ({...r, paddlers: (r.paddlers || []).filter((p: Paddler) => p.id !== id)}))
        setRegatta(prev => ({...prev, paddlers: remaining, races: nextRaces}))
    }

    const handleSave = (row: Paddler) => {
        // update paddler in regatta.paddlers and in any race.paddlers
        const nextPaddlers = (regatta.paddlers || []).map(p => p.id === row.id ? {...p, ...row} : p)
        const nextRaces = (regatta.races || []).map(r => ({...r, paddlers: (r.paddlers || []).map((p: Paddler) => p.id === row.id ? {...p, ...row} : p)}))
        setRegatta(prev => ({...prev, paddlers: nextPaddlers, races: nextRaces}))
    }

    const filtered: Paddler[] = regatta.paddlers || []
    const [showAddPaddler, setShowAddPaddler] = useState(false)
    const [newPaddler, setNewPaddler] = useState<Partial<Paddler>>({name: '', gender: 'M', weight: undefined, birthdate: ''})

    const toggleAllocation = (paddlerId: string, raceId: string, checked: boolean) => {
        logger.debug("Toggling allocation of paddler", paddlerId);
        const nextRaces = (regatta.races || []).map(r => {
            if (r.id !== raceId) return r
            const existing = r.paddlers || []
            if (checked) {
                // add paddler object from regatta.paddlers
                const p = (regatta.paddlers || []).find(pp => pp.id === paddlerId)
                if (!p) return r
                // avoid duplicates
                if (existing.find((e: Paddler) => e.id === paddlerId)) return r
                return {...r, paddlers: [...existing, p]}
            } else {
                return {...r, paddlers: existing.filter((e: Paddler) => e.id !== paddlerId)}
            }
        })

        setRegatta(prev => ({...prev, races: nextRaces}))
    }

    return (
        <div className={`p-6 max-w-[900px] mx-auto flex flex-col gap-4`}>
            <header className={`flex items-center justify-between mb-6`}>
                <div>
                    <div className="mb-4 max-w-[900px]">
                        <Breadcrumb items={[{label: 'Home', to: '/'}]} title="Regatta management" backPath={'/'} />
                    </div>
                    <h1 className={`text-2xl font-semibold`}>Regatta race allocations - {regatta.name}</h1>
                    <p className={`text-sm text-gray-500`}>Manage races and race allocations</p>
                </div>
                <div className="">
                    <button onClick={() => {
                        navigate('/setupboard')
                    }} className={`px-4 py-2 bg-green-500 text-white rounded`}>Boat configuration</button>
                </div>
            </header>
            <div> 
                <div className="flex items-center justify-between mb-2">
                    <div className={`mb-2`}>
                        <h1 className={`text-base text-gray-700`}>Races</h1>
                        <p className={`text-xs text-gray-400`}>Manage race allocations</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {!showAddRace && (
                            <button onClick={() => setShowAddRace(true)} className={`px-2 py-1 bg-blue-500 text-white rounded`}>Add race</button>
                        )}

                        {showAddRace && (
                            <div className="flex items-center gap-2 bg-white p-2 rounded border">
                                <select value={newRace.category} onChange={(e) => setNewRace({...newRace, category: e.target.value})} className="px-2 py-1 border rounded w-28">
                                    <option value="">Select category</option>
                                    {categoryOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                                </select>
                                <select value={newRace.type} onChange={(e) => setNewRace({...newRace, type: e.target.value})} className="px-2 py-1 border rounded w-28">
                                    <option value="">Select type</option>
                                    {typeOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                                </select>
                                <select value={newRace.distance} onChange={(e) => setNewRace({...newRace, distance: e.target.value})} className="px-2 py-1 border rounded w-24">
                                    <option value="">Select distance</option>
                                    {distanceOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                                </select>
                                <select value={newRace.boatType} onChange={(e) => setNewRace({...newRace, boatType: e.target.value})} className="px-2 py-1 border rounded w-28">
                                    <option value="">Select boat type</option>
                                    {boatTypeOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                                </select>
                                <button onClick={() => {
                                    // validate
                                    if (!newRace.category || !newRace.type || !newRace.distance || !newRace.boatType) {
                                        // eslint-disable-next-line no-alert
                                        alert('Please fill all race fields')
                                        return
                                    }
                                    const created: Race = {
                                        id: `race_${Date.now()}`,
                                        category: newRace.category as string,
                                        type: newRace.type as string,
                                        distance: newRace.distance as string,
                                        boatType: newRace.boatType as string,
                                        paddlers: []
                                    }
                                    const next = [...races, created]
                                    setRaces(next)
                                    setRegatta(prev => ({...prev, races: next}))
                                    // ensure options include these values so selects elsewhere update
                                    try {
                                        addOption('categories', created.category)
                                        addOption('types', created.type ?? '')
                                        addOption('distances', created.distance ?? '')
                                        addOption('boatTypes', created.boatType ?? '')
                                    } catch (err) {
                                        console.debug('failed to add options', err)
                                    }
                                    setNewRace({category: '', type: '', distance: '', boatType: ''})
                                    setShowAddRace(false)
                                }} className={`px-2 py-1 bg-green-500 text-white rounded`}>Save</button>
                                <button onClick={() => { setShowAddRace(false); setNewRace({category: '', type: '', distance: '', boatType: ''}) }} className={`px-2 py-1 bg-gray-200 text-black rounded`}>Cancel</button>
                            </div>
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
                    // noEdit={true}
                    onSave={handleSaveRace}
                    onDelete={deleteRace}
                />
            </div>
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
                            <div className="flex items-center gap-2 bg-white p-2 rounded border">
                                <input placeholder="Name" value={newPaddler.name} onChange={(e) => setNewPaddler({...newPaddler, name: e.target.value})} className="px-2 py-1 border rounded w-40" />
                                <select value={newPaddler.gender} onChange={(e) => setNewPaddler({...newPaddler, gender: e.target.value})} className="px-2 py-1 border rounded w-24">
                                    <option value="M">M</option>
                                    <option value="F">F</option>
                                    <option value="O">Other</option>
                                </select>
                                <input placeholder="Weight (kg)" value={newPaddler.weight ?? ''} onChange={(e) => setNewPaddler({...newPaddler, weight: e.target.value ? parseFloat(e.target.value) : undefined})} type="number" className="px-2 py-1 border rounded w-24" />
                                <input placeholder="DOB" value={newPaddler.birthdate ?? ''} onChange={(e) => setNewPaddler({...newPaddler, birthdate: e.target.value})} type="date" className="px-2 py-1 border rounded w-36" />
                                <button onClick={() => {
                                    if (!newPaddler.name || newPaddler.name.trim() === '') {
                                        // eslint-disable-next-line no-alert
                                        alert('Name is required')
                                        return
                                    }
                                    if (newPaddler.weight === undefined || Number.isNaN(newPaddler.weight)) {
                                        // eslint-disable-next-line no-alert
                                        alert('Weight is required')
                                        return
                                    }
                                    const created: Paddler = {
                                        id: `p_${Date.now()}`,
                                        name: newPaddler.name as string,
                                        gender: newPaddler.gender,
                                        weight: Number(newPaddler.weight),
                                        birthdate: newPaddler.birthdate
                                    }
                                    const nextP = Array.isArray(regatta.paddlers) ? [...regatta.paddlers, created] : [created]
                                    setRegatta(prev => ({...prev, paddlers: nextP}))
                                    setNewPaddler({name: '', gender: 'M', weight: undefined, birthdate: ''})
                                    setShowAddPaddler(false)
                                }} className={`px-2 py-1 bg-green-500 text-white rounded`}>Save</button>
                                <button onClick={() => { setShowAddPaddler(false); setNewPaddler({name: '', gender: 'M', weight: undefined, birthdate: ''}) }} className={`px-2 py-1 bg-gray-200 text-black rounded`}>Cancel</button>
                            </div>
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
                        // {key: 'weight', title: 'Weight (kg)', editable: true, inputType: 'number', sortable: true, filterable: false},
                        {key: 'gender', title: 'Gender', editable: true, inputType: 'select', options: [{value: 'M', label: 'M'}, {value: 'F', label: 'F'}, {value: 'O', label: 'Other'}], sortable: true, filterable: false},
                        // {key: 'birthdate', title: 'DOB', editable: true, inputType: 'date', sortable: true, filterable: false}
                    ] as Column<Paddler>[])
                    .concat((regatta.races || []).map((race) => ({
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

        </div>
    )
}

export default Manage;
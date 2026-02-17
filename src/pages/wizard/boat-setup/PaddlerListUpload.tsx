import {useSetupState} from "../../../context/SetupContext";
import {useNavigate} from "react-router-dom";
import {useState, useEffect, useRef, useMemo} from "react";
import {processFile} from "../../../utils/DataBuilder";
import ConfigHelper from '../../../utils/ConfigHelper'
import {useRegattaState} from "../../../context/RegattaContext";
import { Regatta } from "../../../types/RegattaType";
import DataTable, { Column } from '../../../components/basic/DataTable'
import { logger } from "../../../common/helpers/logger";
import Breadcrumb from "../../../components/basic/Breadcrumb";

type Paddler = {
    id: string,
    name: string,
    weight?: number,
    gender?: string,
    birthdate?: string | null
}

export default function PaddlerListUpload() {
    const { setting: state, setSetting: setState } = useSetupState()
    const [regatta]:[Regatta] = useRegattaState()
    
    const [mode, setMode] = useState<'upload'|'manual'>('upload')
    const [manualText, setManualText] = useState('')
    const [fileName, setFileName] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [search, setSearch] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [addOpen, setAddOpen] = useState(false)
    const [modalName, setModalName] = useState('')
    const [modalGender, setModalGender] = useState('M')
    const [modalWeight, setModalWeight] = useState('')
    const [modalDob, setModalDob] = useState('')
    // DataTable will manage inline editing UI; page provides onSave/onDelete handlers
    
    const navigate = useNavigate()
    
    // paddlersDisplayed is an array used to render table rows
    const [paddlersDisplayed, setPaddlersDisplayed] = useState<Paddler[]>(() => {
        // if (Array.isArray(state.paddlers)) return state.paddlers
        // if (state.paddlers && typeof state.paddlers === 'object') return Object.keys(state.paddlers).map(k => state.paddlers[k])
        if (Array.isArray(regatta.paddlers)) return regatta.paddlers
        if (regatta.paddlers && typeof regatta.paddlers === 'object') return Object.keys(regatta.paddlers).map(k => regatta.paddlers[k])
        return []
    })

    useEffect(() => {
        // keep local table in sync if global state changes elsewhere
        if (Array.isArray(regatta.paddlers)) {
            setPaddlersDisplayed(regatta.paddlers)
        } else if (regatta.paddlers && typeof regatta.paddlers === 'object') {
            setPaddlersDisplayed(Object.keys(regatta.paddlers).map(k => regatta.paddlers[k]))
        }
    }, [regatta.paddlers])


    const filtered = useMemo(() => {
        if (!search) return paddlersDisplayed
        const q = search.toLowerCase()
        return paddlersDisplayed.filter(p => `${p.name} ${p.id}`.toLowerCase().includes(q))
    }, [paddlersDisplayed, search])

    const handleFileChange = async (file: File | null) => {
        if (!file) return
        setFileName(file.name)
        setLoading(true)
        setError(null)
        setSuccess(null)
        try {
            const rawPaddlers: any = await processFile(file)

            // normalize and ensure unique ids
            const paddlersMap: Record<string, any> = {}
            const paddlersArray: Paddler[] = []
            let idx = 0
            const entries = (rawPaddlers && typeof rawPaddlers === 'object') ? Object.values(rawPaddlers) : []

            entries.forEach((p: any) => {
                idx += 1
                const id = (p && p.id) ? String(p.id).trim() : idx.toString();
                const paddler = {
                    id,
                    name: (p && p.name) ? String(p.name).trim() : `Paddler ${idx}`,
                    weight: p && p.weight ? Number(p.weight) : undefined,
                    gender: p && p.gender ? String(p.gender).trim() : undefined,
                    birthdate: p && p.birthdate ? String(p.birthdate) : null
                }
                paddlersMap[id] = paddler
                paddlersArray.push(paddler)
            })

            if (paddlersArray.length === 0) {
                setError('No paddlers were parsed from the file. Please check the CSV headers and content.')
                setLoading(false)
                return
            }

            // update local table and global state
            regatta.paddlers = paddlersArray;
            // setPaddlersDisplayed(paddlersArray)

            // setState(prev => ({
            //     ...prev,
            //     paddlers: paddlersArray,
            //     configs: prev.configs || {},
            //     configTree: prev.configTree ? ConfigHelper.setPaddlersInNestedConfig(prev.configTree, paddlersMap) : prev.configTree
            // }))

            setSuccess(`${paddlersArray.length} paddlers loaded`)
        } catch (e) {
            console.error('Failed to process file', e)
            setError('Failed to parse file')
        } finally {
            setLoading(false)
        }
    }

    const handleManualParse = () => {
        const lines = manualText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
        const paddlersMap: any = {}
        lines.forEach((line, idx) => {
            const parts = line.split(',').map(p => p.trim())
            const id = parts[0] || `m-${idx}`
            const name = parts[1] || `Paddler ${idx + 1}`
            const weight = parts[2] ? parseInt(parts[2]) : undefined
            const gender = parts[3] || undefined
            const birthdate = parts[4] || null
            paddlersMap[id] = {id, name, weight, gender, birthdate}
        })

        const paddlersArray = Object.keys(paddlersMap).map(k => paddlersMap[k])
        setPaddlersDisplayed(paddlersArray)
        setState(prev => ({
            ...prev,
            paddlers: paddlersArray,
            configs: prev.configs || {},
            configTree: prev.configTree ? ConfigHelper.setPaddlersInNestedConfig(prev.configTree, paddlersMap) : prev.configTree
        }))
    }

    const deletePaddler = (id: string) => {
        logger.debug(`Deleting paddler with id ${id}`)
        const remaining = paddlersDisplayed.filter(p => p.id !== id)
        regatta.paddlers = remaining;

        setPaddlersDisplayed(remaining)
        // setState(prev => ({...prev, paddlers: remaining}))
        // also remove from configTree if present
        if (state.configTree) {
            const currentMap: any = {}
            remaining.forEach(r => currentMap[r.id] = r)
            setState(prev => ({...prev, configTree: ConfigHelper.setPaddlersInNestedConfig(prev.configTree, currentMap)}))
        }
    }

    const handleSave = (updated: any) => {
        // validate minimally
        if (!updated.name || !String(updated.name).trim()) { setError('Name is required'); return }
        if (updated.weight && isNaN(Number(updated.weight))) { setError('Weight must be a number'); return }

        const next = paddlersDisplayed.map(p => p.id === updated.id ? ({...p, ...updated}) : p)
        regatta.paddlers = next
        setPaddlersDisplayed(next)

        // persist into SetupState and update nested configTree if present
        const paddlersMap: any = {}
        next.forEach(p => { paddlersMap[p.id] = p })

        setState(prev => ({
            ...prev,
            paddlers: next,
            configTree: prev.configTree ? ConfigHelper.setPaddlersInNestedConfig(prev.configTree, paddlersMap) : prev.configTree
        }))

        setError(null)
    }

    const clearAll = () => {
        setPaddlersDisplayed([])
        setFileName(null)
        setManualText('')
        setState(prev => ({...prev, paddlers: []}))
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleAddPaddler = (paddler: any) => {
        // ensure id unique
        const id = paddler.id || `u-${Date.now()}`
        const newP = {
            id,
            name: paddler.name,
            weight: paddler.weight,
            gender: paddler.gender,
            birthdate: paddler.birthdate || null
        }
        const next:Paddler[] = [newP, ...paddlersDisplayed]
        regatta.paddlers = next;

        // setPaddlersDisplayed(next)
        setState(prev => ({
            ...prev,
            paddlers: next,
            configTree: prev.configTree ? ConfigHelper.addPaddlerToNestedConfig(prev.configTree, newP) : prev.configTree
        }))
        setAddOpen(false)
    }

    return (
        <div className={`p-6 max-w-4xl mx-auto`}>
            <header className={`flex items-center justify-between mb-6`}>
                <div>
                    <div className="mb-4 max-w-[900px]">
                        <Breadcrumb items={[{label: 'Home', to: '/'}]} title="Paddler List" backPath={'/'} />
                    </div>
                    <h1 className={`text-2xl font-semibold`}>Paddler list</h1>
                    <p className={`text-sm text-gray-500`}>Upload a CSV or paste paddlers manually. Parsed paddlers appear below.</p>
                </div>
            </header>

            <div>
                <div className={`flex items-center space-x-3`}>
                    <div className={`flex items-center gap-2`}>
                        {/* <button onClick={() => setMode('upload')} className={`px-3 py-1 rounded ${mode==='upload' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Upload file</button> */}
                        {/* <button onClick={() => setMode('manual')} className={`px-3 py-1 rounded ${mode==='manual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Enter manually</button> */}
                        
                    </div>
                    
                </div>
            </div>

            <div className={`mb-1`}> 
                <div className={`flex justify-between gap-3`}> 
                    <>
                        {mode === 'upload' && (
                            <div className={`flex items-center gap-3`}> 
                                <label className={`flex items-center gap-2 bg-white border rounded px-3 py-2 cursor-pointer text-sm`}>
                                    <input ref={fileInputRef} type={`file`} accept={`.csv`} onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} className={`hidden`} />
                                    <span className={`text-sm text-gray-700`}>Upload from CSV</span>
                                </label>
                                {fileName && <div className={`text-sm text-gray-600`}>Selected: <span className={`font-medium`}>{fileName}</span></div>}
                                <button onClick={clearAll} className={`ml-2 px-3 py-1 bg-gray-100 rounded text-sm`}>Clear</button>
                            </div>
                        )}

                        {mode === 'manual' && (
                            <div className={`w-full`}> 
                                <label className={`block text-sm font-medium mb-1`}>Paste paddlers (one per line): <span className={`text-xs font-normal`}>id,name,weight,gender,birthdate</span></label>
                                <textarea value={manualText} onChange={(e) => setManualText(e.target.value)} rows={6} className={`block w-full border border-gray-200 rounded-lg p-2 mb-2`} placeholder={`12345,John Doe,78,M,1990-01-01`}></textarea>
                                <div className={`flex justify-end`}>
                                    <button onClick={handleManualParse} className={`px-3 py-1 bg-blue-500 text-white rounded`}>Parse</button>
                                </div>
                            </div>
                        )}
                    </>

                    <button onClick={async () => {
                        // Save paddlers into SetupState and RegattaState, persist to backend/localStorage, then navigate
                        // const paddlers = paddlersDisplayed || []

                        // // update global SetupState
                        // setState(prev => ({...prev, paddlers}))

                        // // update RegattaContext paddlers
                        // try {
                        //     setRegatta(prev => ({...prev, paddlers}))
                        // } catch (e) {
                        //     console.debug('could not set regatta paddlers', e)
                        // }

                        // // build paddlers map by id for injecting into nested config
                        // const paddlersMap: any = {}
                        // paddlers.forEach((p: any) => { if (p && p.id) paddlersMap[p.id] = p })

                        // // determine existing nested tree (prefer SetupState then Regatta)
                        // const currentTree = state.configTree || regatta.configTree || {}

                        // // try to determine raceName to update; prefer selected meta if available
                        // let raceName: string | null = null
                        // try {
                        //     if (state.selected && state.configs && state.configs[state.selected] && state.configs[state.selected]._meta && state.configs[state.selected]._meta.raceName) {
                        //         raceName = state.configs[state.selected]._meta.raceName
                        //     } else if (regatta.selected && regatta.configs && regatta.configs[regatta.selected] && regatta.configs[regatta.selected]._meta && regatta.configs[regatta.selected]._meta.raceName) {
                        //         raceName = regatta.configs[regatta.selected]._meta.raceName
                        //     } else {
                        //         const keys = Object.keys(currentTree)
                        //         if (keys.length > 0) raceName = keys[0]
                        //     }
                        // } catch (e) {
                        //     console.debug('determine raceName failed', e)
                        // }

                        // build a new tree with paddlers injected into the selected race (or whole tree)
                        let toSaveTree: any = JSON.parse(JSON.stringify(regatta || {}))
                        // try {
                        //     if (raceName && toSaveTree[raceName]) {
                        //         // apply paddlers to just this race's categories array
                        //         toSaveTree[raceName] = ConfigHelper.setPaddlersInNestedConfig(toSaveTree[raceName], paddlersMap)
                        //     } else {
                        //         // apply to whole tree (safe fallback)
                        //         toSaveTree = ConfigHelper.setPaddlersInNestedConfig(toSaveTree, paddlersMap)
                        //     }
                        // } catch (e) {
                        //     console.debug('inject paddlers into tree failed', e)
                        // }

                        // // attempt backend save (POST like create); fallback to localStorage merge
                        // try {
                        //     const body: any = {}
                        //     if (raceName) {
                        //         body.name = raceName
                        //         body.config = { [raceName]: toSaveTree[raceName] || toSaveTree }
                        //     } else {
                        //         body.config = toSaveTree
                        //     }
                        //     await fetch('/api/races', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)})
                        // } catch (e) {
                        //     console.debug('backend save failed', e)
                        // }




                        // persist to localStorage merging into existing 'seatplan.races'
                        try {
                            const raw = localStorage.getItem('seatplan.races')
                            const existing = raw ? JSON.parse(raw) : {}
                            const merged = {...existing, ...toSaveTree}
                            localStorage.setItem('seatplan.races', JSON.stringify(merged))
                        } catch (e) {
                            console.debug('localStorage save failed', e)
                        }

                        // navigate('/setupboard')
                        navigate('/category', {
                            state: {
                                next: '/type',
                                from: '/paddlers',
                            }
                        });
                    }} className={`px-4 py-2 bg-green-500 text-white rounded`}>Next</button>
                </div>
                

                <div className={`mt-4 flex items-center justify-between`}> 
                    <div className={`flex items-center gap-3`}> 
                        <div className={`text-sm text-gray-600`}>{paddlersDisplayed.length} paddler(s)</div>
                        
                        {loading && <div className={`text-sm text-gray-500`}>Parsing...</div>}
                        {error && <div className={`text-sm text-red-600`}>{error}</div>}
                        {success && <div className={`text-sm text-green-600`}>{success}</div>}
                    </div>
                    <div className={`flex items-center gap-2`}> 
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search by name or id`} className={`border rounded px-2 py-1 text-sm`} />
                        <button onClick={() => setSearch('')} className={`px-3 py-1 bg-gray-100 rounded text-sm`}>Reset</button>
                    </div>
                </div>
            </div>
            <button onClick={() => setAddOpen(true)} className={`px-3 py-1 bg-indigo-500 text-white rounded text-sm my-2`}>Add paddler</button>

            <div className={`mt-4`}> 
                <DataTable
                    data={filtered}
                    rowKey={'id'}
                    columns={[
                        {key: 'id', title: 'ID'},
                        {key: 'name', title: 'Name', editable: true, inputType: 'text'},
                        {key: 'weight', title: 'Weight (kg)', editable: true, inputType: 'number'},
                        {key: 'gender', title: 'Gender', editable: true, inputType: 'select', options: [{value: 'M', label: 'M'}, {value: 'F', label: 'F'}, {value: 'O', label: 'Other'}]},
                        {key: 'birthdate', title: 'DOB', editable: true, inputType: 'date'}
                    ] as Column<Paddler>[]}
                    onSave={handleSave}
                    onDelete={deletePaddler}
                />
            </div>
            {addOpen && (
                <div className={`fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40`}> 
                    <div className={`bg-white p-6 rounded shadow-lg w-full max-w-md`}> 
                        <h3 className={`text-lg font-semibold mb-4`}>Add paddler</h3>
                        <div className={`space-y-3`}> 
                            <div>
                                <label className={`block text-sm font-medium`}>Name</label>
                                <input value={modalName} onChange={e => setModalName(e.target.value)} className={`w-full border rounded p-2`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium`}>Weight (kg)</label>
                                <input value={modalWeight} onChange={e => setModalWeight(e.target.value)} className={`w-full border rounded p-2`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium`}>Gender</label>
                                <select value={modalGender} onChange={e => setModalGender(e.target.value)} className={`w-full border rounded p-2`}>
                                    <option value={`M`}>M</option>
                                    <option value={`F`}>F</option>
                                    <option value={`O`}>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium`}>Date of birth</label>
                                <input type={`date`} value={modalDob} onChange={e => setModalDob(e.target.value)} className={`w-full border rounded p-2`} />
                            </div>
                        </div>
                        <div className={`mt-4 flex justify-end space-x-2`}> 
                            <button onClick={() => { setAddOpen(false); }} className={`px-3 py-1 bg-gray-200 rounded`}>Cancel</button>
                            <button onClick={() => {
                                if (!modalName.trim()) { setError('Name is required'); return }
                                const weightNum = modalWeight ? Number(modalWeight) : undefined
                                if (modalWeight && isNaN(weightNum as any)) { setError('Weight must be a number'); return }
                                handleAddPaddler({ name: modalName.trim(), weight: weightNum, gender: modalGender, birthdate: modalDob || null })
                                setModalName('')
                                setModalWeight('')
                                setModalGender('M')
                                setModalDob('')
                                setError(null)
                            }} className={`px-3 py-1 bg-blue-500 text-white rounded`}>Add</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "../common/helpers/logger";
import Breadcrumb from '../components/basic/Breadcrumb';
import Container from '../components/basic/Container';
import RaceBoard from "../components/board/RaceBoard";
import { ListWidget } from "../components/complex/widgets/ListWidget";
import { useRegattaState } from "../context/RegattaContext";
import { Race } from "../types/RegattaType";

export function SetupBoard() {
    // const [state, setState] = useSetupState()
    const {state: regatta} = useRegattaState();
    const [selection, setSelection] = useState<string | null>(null)
    const [race, setRace] = useState<Race|null>(null)

    const navigate = useNavigate()

    useEffect(() => {
        logger.debug("SetupBoard mounted with regatta state", regatta)
        if (!regatta) {
            logger.debug("Regatta missing in SetupBoard, redirecting to root")
            navigate('/', { replace: true })
        }
    // eslint-disable-next-line 
    }, [regatta])

    const handleSelection = (value: string) => {
        if (value) {
            const [ageCategory, genderCategory, distance, boatType] = value.split("-");

            const selectedRace:Race = regatta.races.find(race => {
                return race.category === ageCategory &&
                    race.type === genderCategory &&
                    race.distance === distance &&
                    race.boatType === boatType;
            });

            if (!selectedRace.configs) {
                selectedRace.configs = [];
            }

            if (!selectedRace.paddlers) {
                selectedRace.paddlers = regatta.paddlers
            }
            setRace(selectedRace);
            setSelection(value)
        }
    }

    const handleUpdateConfig = (index: number, config: any) => {
        logger.debug("Updating config", {
            index, config, selection,race
        })
    }


    return (
        <Container className="py-8">
            <div className="w-full">
                <div className="mb-4">
                    <Breadcrumb items={[{label: 'Home', to: '/'}]} title={`Boat configuration`} backPath={'/'} />
                </div>
                <h1 className={`w-full flex py-2 font-semibold`}>Regatta: {regatta ? regatta.name : ""}</h1>
            </div>

            <div className={`flex flex-col lg:flex-row gap-6`}> 

                {regatta && (
                    <div className={`lg:w-80 w-full`}>
                        <div className="flex items-end gap-2 w-full">
                            <ListWidget label={"Race listing"}
                                        items={regatta.races.map(config => `${config.category}-${config.type}-${config.distance}-${config.boatType}`) ?? []}
                                        selectedIndex={selection ? regatta.races?.findIndex(config => `${config.category}-${config.type}-${config.distance}-${config.boatType}` === selection) : -1}
                                        setSelection={handleSelection}
                            />
                            {/* {selection && (
                                <button 
                                className={`text-sm text-blue-500 border border-blue-500 rounded px-2 py-1`}
                                onClick={() => {
                                    race.configs = [];
                                }}>Reset configs</button>
                            )} */}
                            {/* <label className="flex items-center gap-2">
                                <input
                                type="checkbox"
                                checked={showWeights}
                                onChange={e => setShowWeights(e.target.checked)}
                                />
                                <span className="text-sm text-gray-800">Show Weights</span>
                                </label> */}
                        </div>
                        <div className={`flex-1`}>
                            {race && (
                                <RaceBoard race={race} onUpdateConfig={handleUpdateConfig} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Container>
    )

    // return (
    //     <div className={`p-8`}>
    //         {!true && (
    //             <div className={`flex flex-col items-center`}>
    //                 <span>Loading</span>
    //                 <button className={`bg-teal-200 ring-1 p-2`} onClick={() => {
    //                     navigate('/')
    //                 }}>Cancel
    //                 </button>
    //             </div>
    //         )}
    //         {true && (
    //             <div className={`flex justify-center`}>
    //                 <div className={`flex-1`}> 
    //         <div className="w-full">
    //             <div className="mb-4 max-w-[900px] mx-auto px-2">
    //                 <nav className="hidden sm:block" aria-label="Breadcrumb">
    //                     <ol className="flex items-center space-x-2 text-sm text-gray-500">
    //                         <li><Link to="/" className="text-gray-600 hover:text-gray-800 bg-white px-2 py-1 rounded">Home</Link></li>
    //                         <li>
    //                             <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    //                                 <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    //                             </svg>
    //                         </li>
    //                         <li><Link to="/seat-plan" className="text-gray-600 hover:text-gray-800 px-2 py-1 rounded">Setup</Link></li>
    //                         <li>
    //                             <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    //                                 <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    //                             </svg>
    //                         </li>
    //                         <li><span className="text-gray-800 font-medium truncate max-w-[40ch] px-2 py-1">{breadcrumbTitle}</span></li>
    //                     </ol>
    //                 </nav>

    //                 <div className="sm:hidden">
    //                     <button onClick={() => navigate('/')} className="text-sm text-gray-600 hover:text-gray-800 bg-white px-3 py-1 rounded flex items-center gap-2">
    //                         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    //                             <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    //                         </svg>
    //                         Back
    //                     </button>
    //                 </div>

    //             <h1 className={`w-full flex py-2 font-semibold`}>
    //                 {regatta.name}
    //             </h1>

    //             </div>
    //                         <h3 className={`text-sm font-medium`}>Race configurations</h3>
    //                         <button onClick={() => setCreateOpen(true)} className={`text-sm bg-green-500 text-white px-2 py-1 rounded`}>New</button>
    //                     </div>

    //                     <ListWidget label={"Race listing"}
    //                                 items={state.raceList ?? []}
    //                                 selectedIndex={state.raceList.indexOf(selection) + 1}
    //                                 setSelection={handleSelection}
    //                     />
    //                 </div>

    //                 <CreateRaceModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={async (name: string) => {
    //                     // try to create via backend; fallback to local. Save under the provided race name using nested tree format.
    //                     try {
    //                         const res = await fetch('/api/races', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({name})})
    //                         if (res.ok) {
    //                             const created = await res.json()
    //                             // expect created to be {name, config}
    //                             const configs = {...state.configs}
    //                             configs[created.name] = created.config || {paddlers: {}, configs: []}
    //                             const raceList = Array.isArray(state.raceList) ? [...state.raceList, created.name] : [created.name]
    //                             setState({...state, configs, raceList})
    //                             setSelection(created.name)
    //                             navigate('/seat-plan')
    //                             return
    //                         }
    //                     } catch (e) {
    //                         console.debug('create backend failed', e)
    //                     }

    //                     // fallback: build a nested tree and persist locally under the provided name
    //                     const categories = (state.categories || "").split(",").map(s => s.trim()).filter(Boolean)
    //                     const types = (state.types || "").split(",").map(s => s.trim()).filter(Boolean)
    //                     const distances = (state.distance || "").split(",").map(s => s.trim()).filter(Boolean)
    //                     const boats = (state.boatType || "").split(",").map(s => s.trim()).filter(Boolean)

    //                     const cats = categories.length ? categories : ["Default"]
    //                     const tps = types.length ? types : ["Default"]
    //                     const dists = distances.length ? distances : ["200m"]
    //                     const bts = boats.length ? boats : ["Standard"]

    //                     const newTree = { [name]: ConfigHelper.buildNestedConfig(cats, tps, dists, bts) }

    //                     const buildFlatFromTree = (tree: any) => {
    //                         const flat: any = {}
    //                         Object.keys(tree).forEach((raceName) => {
    //                             const categories = tree[raceName]
    //                             if (!Array.isArray(categories)) return
    //                             categories.forEach((catObj: any) => {
    //                                 const cat = Object.keys(catObj)[0]
    //                                 const types = catObj[cat]
    //                                 types.forEach((typeObj: any) => {
    //                                     const type = Object.keys(typeObj)[0]
    //                                     const distances = typeObj[type]
    //                                     distances.forEach((distObj: any) => {
    //                                         const dist = Object.keys(distObj)[0]
    //                                         const boats = distObj[dist]
    //                                         boats.forEach((boatObj: any) => {
    //                                             const boat = Object.keys(boatObj)[0]
    //                                             const value = boatObj[boat]
    //                                             const key = `${cat}-${type}-${dist}-${boat}`
    //                                             flat[key] = {
    //                                                 ...(value || {paddlers: {}, configs: []}),
    //                                                 _meta: { raceName, category: cat, type, distance: dist, boatType: boat }
    //                                             }
    //                                         })
    //                                     })
    //                                 })
    //                             })
    //                         })
    //                         return flat
    //                     }

    //                     const flat = buildFlatFromTree(newTree)

    //                     // merge into stored tree in localStorage
    //                     try {
    //                         const raw = localStorage.getItem('seatplan.races')
    //                         const stored = raw ? JSON.parse(raw) : {}
    //                         const merged = {...stored, ...newTree}
    //                         localStorage.setItem('seatplan.races', JSON.stringify(merged))
    //                     } catch (_) {}

    //                     // update app state
    //                     // setState(prev => ({...prev, configTree: {...(prev.configTree || {}), ...newTree}, configs: {...(prev.configs || {}), ...flat}, raceList: Array.isArray(prev.raceList) ? [...prev.raceList, name] : [name]}))
    //                     setSelection(name)
    //                     navigate('/seat-plan')
    //                 }} />
    //             </div>
    //         )}
    //     </div>
    // )
};

export default SetupBoard;
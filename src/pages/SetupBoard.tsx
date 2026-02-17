import {useEffect, useState, useMemo} from "react";
import {useSetupState} from "../context/SetupContext";
import {ListWidget} from "../components/complex/widgets/ListWidget";
import RaceBoard from "../components/board/RaceBoard";
import CreateRaceModal from "../components/complex/modals/CreateRaceModal";
import {BoatPosition} from "../enums/BoatConstant";
import {useNavigate, Link} from "react-router-dom";
import Breadcrumb from '../components/basic/Breadcrumb'
import ConfigHelper from '../utils/ConfigHelper'
import { useRegattaState } from "../context/RegattaContext";
import { logger } from "../common/helpers/logger";
import { Race, Regatta } from "../types/RegattaType";

export function SetupBoard() {
    // const [state, setState] = useSetupState()
    const [regatta]: [Regatta] = useRegattaState();
    const [selection, setSelection] = useState(null)
    const [race, setRace] = useState<Race|null>(null)
    const [createOpen, setCreateOpen] = useState(false)

    const navigate = useNavigate()

    // useEffect(() => {
    //     if (!("raceList" in state)) {
    //         navigate('/seat-plan')
    //     } else {
    //         setSelection(state.raceList[0])
    //     }
    //     return () => {
    //     }
    // }, [state, navigate]);

    // useEffect(() => {
    //     if (selection && state.configs) {
    //         if (selection in state.configs) {
    //             setBoardConfigs(state.configs[selection])
    //         }
    //     }
    //     return () => {
    //     }
    // }, [selection, state.configs]);

    // useEffect(() => {
    //     if (selection) {
    //         const {paddlers, configs} = state
    //
    //         if (!configs || selection ! in configs) {
    //             const [ageCategory, genderCategory, distance, boatType] = selection.split("-")
    //             const _paddlers: any = Array.from(paddlers.map((paddler: any) => ({
    //                 ...paddler,
    //                 content: paddler.name
    //             })))
    //
    //             const boatSize = BoatSize[boatType.toUpperCase()]
    //             const _configs = Array.from({length: 3}, (value, index) => {
    //                 return [
    //                     getItems(1, 0, "scratch"),
    //                     getItems(1, 1, "drummer"),
    //                     getItems(boatSize, boatSize, "left"),
    //                     getItems(boatSize, boatSize, "right"),
    //                     getItems(1, 1, "sweep")
    //                 ]
    //             })
    //
    //             // setState({
    //             //     ...state,
    //             //     configs: {
    //             //         [selection]: {
    //             //             paddlers: _paddlers,
    //             //             configs: _configs
    //             //         }
    //             //     }
    //             // })
    //
    //             setBoardConfigs({
    //                 paddlers: _paddlers,
    //                 configs: _configs
    //             })
    //         }
    //     }
    //     return () => {
    //     }
    // }, [selection, state]);

    // useEffect(() => {
    //     if (state.configs) {
    //         // prefer previously selected race if present in state
    //         if ((state as any).selected && (state as any).selected in state.configs) {
    //             setSelection((state as any).selected)
    //         } else {
    //             setSelection(Object.keys(state.configs)[0])
    //         }
    //     }
    //     return () => {
    //     }
    // }, [state.configs]);

    // fetching saved races moved to SetupHome component

    const breadcrumbTitle = useMemo(() => {
        if (race && regatta.name) {
            return `${regatta.name} — ${race.category} ${race.boatType}`
        }
        if (regatta.name) return regatta.name
        return 'Board'
    }, [regatta.name, race])

    // const addPaddler = (paddler: any) => {
    //     // If we have a nested config tree, add paddler into the tree and rebuild flat configs
    //     if (state.configTree) {
    //         const newTree = ConfigHelper.addPaddlerToNestedConfig(state.configTree, paddler)

    //         const buildFlatFromTree = (tree: any) => {
    //             const flat: any = {}
    //             Object.keys(tree).forEach((raceName) => {
    //                 const categories = tree[raceName]
    //                 if (!Array.isArray(categories)) return
    //                 categories.forEach((catObj: any) => {
    //                     const cat = Object.keys(catObj)[0]
    //                     const types = catObj[cat]
    //                     types.forEach((typeObj: any) => {
    //                         const type = Object.keys(typeObj)[0]
    //                         const distances = typeObj[type]
    //                         distances.forEach((distObj: any) => {
    //                             const dist = Object.keys(distObj)[0]
    //                             const boats = distObj[dist]
    //                             boats.forEach((boatObj: any) => {
    //                                 const boat = Object.keys(boatObj)[0]
    //                                 const value = boatObj[boat]
    //                                 const key = `${cat}-${type}-${dist}-${boat}`
    //                                 flat[key] = {
    //                                     ...(value || {paddlers: {}, configs: []}),
    //                                     _meta: { raceName, category: cat, type, distance: dist, boatType: boat }
    //                                 }
    //                             })
    //                         })
    //                     })
    //                 })
    //             })
    //             return flat
    //         }

    //         const flat = buildFlatFromTree(newTree)
    //         const globalPaddlers = Array.isArray(state.paddlers) ? [...state.paddlers] : []
    //         globalPaddlers.push(paddler)

    //         setState({
    //             ...state,
    //             configTree: newTree,
    //             configs: flat,
    //             paddlers: globalPaddlers
    //         })
    //         return
    //     }

    //     // create new configs map to avoid mutating nested objects in-place
    //     const configs = {...state.configs}
    //     if (!configs[selection]) configs[selection] = {paddlers: {}, configs: []}

    //     const existingPaddlers = configs[selection].paddlers || {}
    //     const newPaddlersMap = {
    //         ...existingPaddlers,
    //         [paddler.id]: paddler
    //     }

    //     // also add to each saved config's reserve group so it appears in the ReserveSection
    //     const savedConfigs = Array.isArray(configs[selection].configs) ? configs[selection].configs : []
    //     const newSavedConfigs = savedConfigs.map((savedCfg: any) => {
    //         const group = Array.isArray(savedCfg) ? [...savedCfg] : []
    //         const reserveIndex = BoatPosition.RESERVE
    //         if (!group[reserveIndex]) group[reserveIndex] = []
    //         // insert new paddler object with 'content' for label
    //         group[reserveIndex] = [{...paddler, content: paddler.name}, ...group[reserveIndex]]
    //         return group
    //     })

    //     // replace the nested selection object with a new object reference
    //     configs[selection] = {
    //         ...configs[selection],
    //         paddlers: newPaddlersMap,
    //         configs: newSavedConfigs
    //     }

    //     // const globalPaddlers = Array.isArray(state.paddlers) ? [...state.paddlers] : []
    //     // globalPaddlers.push(paddler)

    //     // setState({
    //     //     ...state,
    //     //     configs,
    //     //     paddlers: globalPaddlers
    //     // })
    // }

    const handleSelection = (value: string) => {
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

    const handleUpdateConfig = (index: number, config: any) => {
        logger.debug("Updating config", {
            index, config, selection,race
        })
        // const selectedConfig = state.configs[selection]
        // if (selectedConfig.configs.length < index + 1) {
        //     selectedConfig.configs.push(config)
        // } else {
        //     selectedConfig.configs.splice(index, 1)
        //     selectedConfig.configs.splice(index, 0, config)
        // }

        
        // fetch configs from regatta based on selection
        if (race.configs) {
            if (race.configs.length === 0) {
                race.configs.push(config);
            } else {
                race.configs.splice(index, 1)
                race.configs.splice(index, 0, config)
            }
        } else {
            race.configs = [config];
        }

        // const configs = state.configs
        // logger.debug("Current configs before update", configs, "for selection", selection)

        // if (configs[selection].configs.length < index + 1) {
        //     configs[selection].configs.push(config)
        // } else {
        //     configs[selection].configs.splice(index, 1)
        //     configs[selection].configs.splice(index, 0, config)
        // }

        // console.log(configs)

        // setState({
        //     ...state,
        //     configs
        // })

        // const selectedConfig = state.configs[selection] ?? {}
        // if (selectedConfig) {
        //     selectedConfig.config.splice(index, 1)
        //     selectedConfig.config.splice(index, 0, config)
        //     setState({
        //         ...state,
        //         configs: {
        //             [selection]: selectedConfig
        //         }
        //     })
        // } else {
        //     console.log("selected Config not set")
        // }
    }


    return (
        <div className={`p-8`}>
            <div className="w-full">
                <div className="mb-4 max-w-[900px] mx-auto px-2">
                    <Breadcrumb items={[{label: 'Home', to: '/'}, {label: 'Setup', to: '/seat-plan'}]} title={breadcrumbTitle} backPath={'/'} />
                </div>
                <h1 className={`w-full flex py-2 font-semibold`}>
                    {regatta.name}
                </h1>
            </div>
            <div className={`flex justify-center`}>
                {race && (
                    <div className={`flex-1`}> 
                        <RaceBoard
                            race={race}
                            onUpdateConfig={handleUpdateConfig}
                            // onAddPaddler={addPaddler}
                        />
                    </div>)
                }

                <div className={`float-right pl-8`}>
                    <ListWidget label={"Race listing"}
                                items={regatta.races.map(config => `${config.category}-${config.type}-${config.distance}-${config.boatType}`) ?? []}
                                selectedIndex={selection ? regatta.races?.findIndex(config => `${config.category}-${config.type}-${config.distance}-${config.boatType}` === selection) - 1 : -1}
                                setSelection={handleSelection}
                    />
                </div>
            </div>
        </div>
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
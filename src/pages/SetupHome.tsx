import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSetupState} from '../context/SetupContext';
import {useRegattaState} from '../context/RegattaContext';
import {ListWidget} from '../components/complex/widgets/ListWidget';
import CreateRaceModal from '../components/complex/modals/CreateRaceModal';
import { logger } from '../common/helpers/logger';
import { Race } from '../types/RegattaType';

export default function SetupHome() {
    // const [state, setState] = useSetupState()
    const [regatta, setRegattaState] = useRegattaState()
    const [regattaConfigs, setRegattaConfigs] = useState<Race[]>([]);

    const [regattaList, setRegattaList] = useState<string[]>([])
    const [createOpen, setCreateOpen] = useState(false)

    const navigate = useNavigate()

    // // Helpers to convert between nested tree and flat configs
    // const buildTreeFromSelections = (name: string, categories: string[], types: string[], distances: string[], boats: string[]) => {
    //     // tree: { name: [ { category: [ { type: [ { distance: [ { boat: { paddlers, configs } } ] } ] } ] } ] ] }
    //     const categoryNodes = categories.map(cat => {
    //         const typeNodes = types.map(t => {
    //             const distanceNodes = distances.map(d => {
    //                 const boatNodeArr = boats.map(b => ({ [b]: { paddlers: {}, configs: [] } }))
    //                 return { [d]: boatNodeArr }
    //             })
    //             return { [t]: distanceNodes }
    //         })
    //         return { [cat]: typeNodes }
    //     })

    //     return { [name]: categoryNodes }
    // }

    // const buildFlatFromTree = (tree: any) => {
    //     const flat: any = {}
    //     Object.keys(tree).forEach((raceName) => {
    //         const categories = tree[raceName]
    //         if (!Array.isArray(categories)) return
    //         categories.forEach((catObj: any) => {
    //             const cat = Object.keys(catObj)[0]
    //             const types = catObj[cat]
    //             types.forEach((typeObj: any) => {
    //                 const type = Object.keys(typeObj)[0]
    //                 const distances = typeObj[type]
    //                 distances.forEach((distObj: any) => {
    //                     const dist = Object.keys(distObj)[0]
    //                     const boats = distObj[dist]
    //                     boats.forEach((boatObj: any) => {
    //                         const boat = Object.keys(boatObj)[0]
    //                         const value = boatObj[boat]
    //                         const key = `${cat}-${type}-${dist}-${boat}`
    //                         flat[key] = {
    //                             ...(value || {paddlers: {}, configs: []}),
    //                             _meta: { raceName, category: cat, type, distance: dist, boatType: boat }
    //                         }
    //                     })
    //                 })
    //             })
    //         })
    //     })
    //     return flat
    // }

    useEffect(() => {
        // First, load any cached races from localStorage so the UI shows immediately
        try {
            // const raw = localStorage.getItem('seatplan.races')
            const raw = localStorage.getItem('regattaConfigs')
            if (raw) {
                const tree = JSON.parse(raw)
                setRegattaConfigs(tree);
            }
        } catch (err) {
            logger.debug('no local races', err)
        }

        // Then attempt to refresh from backend; if available overwrite the cache and state
        const loadRaces = async () => {
            try {
                const res = await fetch('/api/races')
                if (!res.ok) throw new Error('no backend')
                const data = await res.json()
                if (Array.isArray(data.races)) {
                    // backend returns array of {name, configTree}
                    const tree: any = {}
                    data.races.forEach((r: any) => {
                        tree[r.name] = r.config || {paddlers: {}, configs: []}
                    })
                    // const flat = buildFlatFromTree(tree)
                    // const raceList = Object.keys(flat)
                    // setState(prev => ({...prev, raceList, configs: flat, configTree: tree}))
                    try { localStorage.setItem('seatplan.races', JSON.stringify(tree)) } catch (_) {}
                } else if (data && typeof data === 'object') {
                    // assume backend returned a nested tree
                    const tree: any = data
                    // const flat = buildFlatFromTree(tree)
                    // const raceList = Object.keys(flat)
                    // setState(prev => ({...prev, raceList, configs: flat, configTree: tree}))
                    try { localStorage.setItem('seatplan.races', JSON.stringify(tree)) } catch (_) {}
                }
            } catch (e) {
                logger.debug('Could not load races from backend', e)
            }
        }
        void loadRaces()
    // eslint-disable-next-line
    }, [])

    const handleCreate = async (name: string) => {
        const regatta = { name, paddlers: {}, races: [] };
        setRegattaState(regatta);
        // navigate('/category');
        navigate('/paddlers');



        // // build nested tree from current selections (if available)
        // const categories = (state.categories || "").split(",").map(s => s.trim()).filter(Boolean)
        // const types = (state.types || "").split(",").map(s => s.trim()).filter(Boolean)
        // const distances = (state.distance || "").split(",").map(s => s.trim()).filter(Boolean)
        // const boats = (state.boatType || "").split(",").map(s => s.trim()).filter(Boolean)

        // // default to at least one value so tree/flat produce entries
        // const cats = categories.length ? categories : ["Default"]
        // const tps = types.length ? types : ["Default"]
        // const dists = distances.length ? distances : ["200m"]
        // const bts = boats.length ? boats : ["Standard"]

        // const newTree = buildTreeFromSelections(name, cats, tps, dists, bts)

        // // delegate persistence and regatta initialization to RegattaContext actions
        // try {
        //     if (regattaActions && typeof regattaActions.createRace === 'function') {
        //         await regattaActions.createRace(name, newTree)
        //     }
        // } catch (e) {
        //     console.debug('createRace action failed', e)
        // }

        // navigate('/category')
    }

    const [, setRegatta, regattaActions] = useRegattaState()

    const parseRegattaData = (value: string) => {

    }

    const handleSelect = (value: string) => {
        logger.debug("Selected regatta", value, "with configs", regattaConfigs[value]);
        setRegatta(regattaConfigs[value] || { name: value, paddlers: {}, configs: [] });

        // set selected race in global state and navigate into the wizard
        // setState(prev => ({...prev, selected: value}))



        // determine raceName and load corresponding nested tree and flat configs
        // const flatAll = state.configs || {}
        // let raceName = value
        // if (flatAll[value] && flatAll[value]._meta && flatAll[value]._meta.raceName) {
        //     raceName = flatAll[value]._meta.raceName
        // }

        // let regattaTree: any = {}
        // let regattaFlat: any = {}
        // let regattaPaddlers: any[] = []

        // if (state.configTree && state.configTree[raceName]) {
        //     // load nested tree for this race
        //     regattaTree = { [raceName]: state.configTree[raceName] }
        //     regattaFlat = buildFlatFromTree(regattaTree)
        //     // prefer paddlers from the selected flat key if present
        //     const selectedFlat = regattaFlat[value] || flatAll[value]
        //     if (selectedFlat && selectedFlat.paddlers) {
        //         const pm = selectedFlat.paddlers
        //         regattaPaddlers = Array.isArray(pm) ? pm : Object.keys(pm || {}).map(k => pm[k])
        //     }
        // } else {
        //     // fall back to filtering existing flat configs by raceName
        //     const keys = Object.keys(flatAll).filter(k => flatAll[k]?._meta?.raceName === raceName)
        //     keys.forEach(k => regattaFlat[k] = flatAll[k])
        //     const selectedFlat = regattaFlat[value] || flatAll[value]
        //     if (selectedFlat && selectedFlat.paddlers) {
        //         const pm = selectedFlat.paddlers
        //         regattaPaddlers = Array.isArray(pm) ? pm : Object.keys(pm || {}).map(k => pm[k])
        //     }
        // }

        // setRegatta(prev => ({...prev, selected: value, configTree: regattaTree, configs: regattaFlat, paddlers: regattaPaddlers, raceList: Object.keys(regattaFlat)}))


        // navigate('/setupboard');
        navigate('/manage');
    }

    return (
        <div className={`p-6 max-w-[900px] mx-auto`}>
            <header className={`flex items-center justify-between mb-6`}>
                <div>
                    <h1 className={`text-2xl font-semibold`}>Regatta configurations</h1>
                    <p className={`text-sm text-gray-500`}>Select an existing configuration or create a new one to begin the wizard.</p>
                </div>
                <div>
                    <button onClick={() => setCreateOpen(true)} className={`px-4 py-2 bg-green-500 text-white rounded`}>New configuration</button>
                </div>
            </header>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
                <div>
                        <ListWidget
                            label={`Saved configurations`}
                            // items={state.raceList ?? []}
                            items={Object.keys(regattaConfigs) ?? []}
                            setSelection={(v) => handleSelect(v)}
                            selectedIndex={Object.keys(regattaConfigs).indexOf(regatta?.name ?? '') + 1}
                        />
                </div>
            </div>

            <CreateRaceModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
        </div>
    )
}

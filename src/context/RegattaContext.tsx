import {createContext, useContext, useEffect, useState} from "react";
import ConfigHelper from '../utils/ConfigHelper'
import {useSetupState} from './SetupContext'
import { Regatta } from "../types/RegattaType";

export const RegattaStateContext = createContext(null)

export function RegattaProvider({children}) {
    // empty regatta state structure; all fields optional but this is the general shape
    // const initial = {
    //     // name: null,
    //     // // currently selected race key (flattened key or custom name)
    //     // selected: null,
    //     // // nested config tree: { raceName: [ categoryNodes ] }
    //     // configTree: {},
    //     // // flattened configs used by UI: { "cat-type-distance-boat": {paddlers, configs, _meta } }
    //     // configs: {},
    //     // // global paddlers list (array for convenience in some components)
    //     // paddlers: [],
    //     // // list of flattened race keys shown in UI
    //     // raceList: [],
    // }

    const [state, setState] = useState<Regatta | null>(null)

    // access SetupState so we can keep the app-level listing in sync
    // const [, setSetupState] = useSetupState()

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

    // const actions = {
    //     async createRace(name: string, tree: any) {
    //         // fetch paddlers from backend /paddlers endpoint
    //         let paddlersList: any[] = []
    //         try {
    //             const res = await fetch('/paddlers')
    //             if (res.ok) {
    //                 const data = await res.json()
    //                 if (Array.isArray(data)) paddlersList = data
    //                 else if (data && Array.isArray((data as any).paddlers)) paddlersList = (data as any).paddlers
    //             }
    //         } catch (e) {
    //             console.debug('could not fetch paddlers', e)
    //         }

    //         // build paddlers map
    //         const paddlersMap: any = {}
    //         paddlersList.forEach((p: any) => { if (p && p.id) paddlersMap[p.id] = p })

    //         // inject paddlers into provided tree for the new race
    //         const treeClone = JSON.parse(JSON.stringify(tree || {}))
    //         try {
    //             if (treeClone[name]) {
    //                 treeClone[name] = ConfigHelper.setPaddlersInNestedConfig(treeClone[name], paddlersMap)
    //             } else {
    //                 // if tree not keyed by name, try to apply to full tree
    //                 const applied = ConfigHelper.setPaddlersInNestedConfig(treeClone, paddlersMap)
    //                 Object.assign(treeClone, applied)
    //             }
    //         } catch (e) {
    //             console.debug('failed to inject paddlers into tree', e)
    //         }

    //         const flat = buildFlatFromTree(treeClone)

    //         // attempt backend persistence
    //         try {
    //             const body: any = { name, config: treeClone[name] ? { [name]: treeClone[name] } : treeClone }
    //             await fetch('/api/races', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)})
    //         } catch (e) {
    //             console.debug('backend create failed', e)
    //         }

    //         // persist to localStorage
    //         try {
    //             const raw = localStorage.getItem('seatplan.races')
    //             const existing = raw ? JSON.parse(raw) : {}
    //             const merged = {...existing, ...treeClone}
    //             localStorage.setItem('seatplan.races', JSON.stringify(merged))
    //         } catch (e) {
    //             console.debug('localStorage save failed', e)
    //         }

    //         // update both regatta state and SetupState so UI lists update
    //         setState(prev => ({...prev, selected: Object.keys(flat)[0] || name, configTree: {...(prev.configTree || {}), ...treeClone}, configs: {...(prev.configs || {}), ...flat}, paddlers: paddlersList, raceList: Object.keys(flat)}))
    //         try { setSetupState(prev => ({...prev, configTree: {...(prev.configTree || {}), ...treeClone}, configs: {...(prev.configs || {}), ...flat}, raceList: Object.keys(flat)})) } catch (_) {}

    //         return { tree: treeClone, flat, paddlers: paddlersList }
    //     }
    // }

    // useEffect(() => {
    //     // on initial load, attempt to get paddlers from backend so they're available for any
    //     if (state.selected) {

    //     }
    // }, [state.selected])

    // const value: any = [state, setState, actions]
    const value: any = [state, setState]

    return (
        <RegattaStateContext.Provider value={value}>
            {children}
        </RegattaStateContext.Provider>
    )
}

export function useRegattaState() {
    const context: any = useContext(RegattaStateContext)
    if (!context) {
        throw new Error("useRegattaState must be used within the RegattaProvider");
    }
    return context;
}

export default RegattaProvider

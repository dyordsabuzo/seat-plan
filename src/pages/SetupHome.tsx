import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/basic/Container';
// import {useSetupState} from '../context/SetupContext';
import { logger } from '../common/helpers/logger';
import CreateRegattaModal from '../components/complex/modals/CreateRegattaModal';
import { ListWidget } from '../components/complex/widgets/ListWidget';
import { useAuth } from '../context/AuthContext';
import { useRegattaState } from '../context/RegattaContext';
import { useToast } from '../context/ToastContext';
import { Regatta } from '../types/RegattaType';
import * as RegattasStorage from '../utils/RegattasStorage';

export default function SetupHome({clubId}:{clubId?:string}) {
    const [allRegattas, setAllRegattas] = useState<Record<string, Regatta> | null>(null)
    const [selectedRegatta, setSelectedRegatta] = useState<string | null>(null);
    const {state: regatta, setState: setRegattaState} = useRegattaState()
    const { user } = useAuth()
    const { addToast } = useToast()


    // const [races, setRaces] = useState<Race[]>([]);
    const [createOpen, setCreateOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (allRegattas) return
        if (!clubId) return
        let mounted = true
        const load = async () => {
            logger.debug("Attempting to load regatta configs from localStorage and Firestore for club", clubId)
            let local: Record<string, Regatta> = {}

            // load remote regattas for the provided clubId (if any)
            let remote: Record<string, Regatta> = {}
            try {
                if (clubId) {
                    remote = await RegattasStorage.loadRegattasForClub(clubId)
                }
            } catch (e) {
                logger.debug('Failed to load regattas from Firestore', e)
            }

            // merge: prefer remote when present, but include local items
            const merged: Record<string, Regatta> = { ...remote }
            const toPersist: Regatta[] = []
            for (const k of Object.keys(local || {})) {
                if (!merged[k]) {
                    merged[k] = local[k]
                    // schedule for persistence to Firestore
                    toPersist.push(local[k])
                }
            }

            // persist missing local items into Firestore (associate with clubId)
            // Only persist when the user is authenticated to avoid creating
            // documents with empty owners arrays. If the user is not signed in,
            // skip persistence (user can sign in later and we can migrate then).
            if (toPersist.length && clubId) {
                if (user && user.uid) {
                    for (const r of toPersist) {
                        try {
                            await RegattasStorage.upsertRegatta(user.uid, clubId, r)
                            logger.debug('[SetupHome] persisted local regatta to Firestore', r.name)
                        } catch (e) {
                            logger.debug('[SetupHome] failed to persist regatta', r.name, e)
                        }
                    }
                } else {
                    logger.debug('[SetupHome] skipping persistence of local regattas until user signs in', toPersist.map(t => t.name))
                }
            }

            if (mounted) setAllRegattas(merged)
        }
        load()
        return () => { mounted = false }
    // eslint-disable-next-line
    }, [clubId]);

    useEffect(() => {
        if (selectedRegatta) {
            logger.debug("Selected regatta", selectedRegatta, "with configs", allRegattas?.[selectedRegatta]);
            const picked = allRegattas?.[selectedRegatta] || { name: selectedRegatta, paddlers: [], configs: [] }
            setRegattaState(picked);

            // Temporary: ensure selected regatta exists in Firestore for this club.
            // If it does not exist, upsert it. Only runs when a clubId is provided.
            (async () => {
                try {
                    if (!clubId) return logger.debug('[SetupHome] no clubId - skipping remote existence check')
                    logger.debug('[SetupHome] checking Firestore for selected regatta', selectedRegatta)
                    const remote = await RegattasStorage.loadRegattasForClub(clubId)
                    if (!remote || !remote[selectedRegatta]) {
                        if (!user || !user.uid) {
                            logger.debug('[SetupHome] user not signed in - skipping upsert of selected regatta to Firestore')
                            return
                        }
                        logger.debug('[SetupHome] selected regatta missing remotely - upserting', selectedRegatta)
                        try {
                            await RegattasStorage.upsertRegatta(user.uid, clubId, picked)
                            logger.debug('[SetupHome] upserted selected regatta to Firestore', selectedRegatta)
                            try { addToast(`Saved regatta "${selectedRegatta}" to cloud`, 'success') } catch (e) { /* noop */ }
                        } catch (e) {
                            logger.debug('[SetupHome] failed to upsert selected regatta to Firestore', selectedRegatta, e)
                            try { addToast(`Failed to save regatta "${selectedRegatta}": ${String(e)}`, 'error') } catch (er) { /* noop */ }
                        }
                    } else {
                        logger.debug('[SetupHome] selected regatta already exists in Firestore', selectedRegatta)
                    }
                } catch (e) {
                    logger.debug('[SetupHome] error ensuring selected regatta persisted', e)
                }
            })()
        }
        return () => {}
    // eslint-disable-next-line         
    }, [selectedRegatta]);

    const handleCreate = async (name: string) => {
        setRegattaState({ name, paddlers: [], races: [] });
        navigate('/paddlers');
    }

    // const [, setRegatta, regattaActions] = useRegattaState()

    const handleSelect = (value: string) => {
        setSelectedRegatta(value);
    }

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const importRegattaFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            try {
                const text = reader.result as string
                const parsed = JSON.parse(text)
                if (!parsed || typeof parsed !== 'object' || !parsed.name) {
                    // eslint-disable-next-line no-alert
                    alert('Invalid regatta JSON: missing name property')
                    return
                }

                setRegattaState(parsed)

                try {
                    if (user && user.uid && clubId) {
                        try {
                            RegattasStorage.upsertRegatta(user.uid, clubId, parsed)
                            // also update local view
                            setAllRegattas(prev => ({ ...(prev || {}), [parsed.name]: parsed }))
                        } catch (e) {
                            console.error('Failed to persist imported regatta to Firestore', e)
                            // fallback to localStorage
                            const raw = localStorage.getItem('regattaConfigs')
                            const existing = raw ? JSON.parse(raw) : {}
                            existing[parsed.name] = parsed
                            localStorage.setItem('regattaConfigs', JSON.stringify(existing))
                            setAllRegattas(existing)
                        }
                    } else if (user && user.uid) {
                        // user signed-in but no club selected — persist top-level
                        try {
                            RegattasStorage.upsertRegatta(user.uid, undefined, parsed)
                            setAllRegattas(prev => ({ ...(prev || {}), [parsed.name]: parsed }))
                        } catch (e) {
                            console.error('Failed to persist imported regatta to Firestore', e)
                            const raw = localStorage.getItem('regattaConfigs')
                            const existing = raw ? JSON.parse(raw) : {}
                            existing[parsed.name] = parsed
                            localStorage.setItem('regattaConfigs', JSON.stringify(existing))
                            setAllRegattas(existing)
                        }
                    } else {
                        const raw = localStorage.getItem('regattaConfigs')
                        const existing = raw ? JSON.parse(raw) : {}
                        existing[parsed.name] = parsed
                        localStorage.setItem('regattaConfigs', JSON.stringify(existing))
                        setAllRegattas(existing)
                    }
                } catch (err) {
                    console.error('Failed to persist imported regatta', err)
                }

                // eslint-disable-next-line no-alert
                alert(`Imported regatta "${parsed.name}"`)
            } catch (err) {
                // eslint-disable-next-line no-alert
                alert('Failed to parse JSON file')
            }
        }
        reader.readAsText(file)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const triggerImportClick = () => fileInputRef.current?.click()

    const exportRegattaAsJson = () => {
        if (!regatta) {
            // user feedback if no regatta is selected
            // eslint-disable-next-line no-alert
            alert('No regatta selected to export');
            return;
        }

        try {
            const json = JSON.stringify(regatta, null, 2)
            const blob = new Blob([json], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            const safeName = (regatta.name || 'regatta').toString().replace(/\s+/g, '_')
            anchor.href = url
            anchor.download = `${safeName}.json`
            document.body.appendChild(anchor)
            anchor.click()
            anchor.remove()
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Failed to export regatta', err)
        }
    }

    const deleteRegatta = () => {
        if (!regatta) return;
        logger.debug("Deleting regatta with name", regatta.name);
        const raw = localStorage.getItem('regattaConfigs')
        const existing = raw ? JSON.parse(raw) : {}
        delete existing[regatta.name]

        localStorage.setItem('regattaConfigs', JSON.stringify(existing))
        setAllRegattas(existing)
        setRegattaState(null)
    }

    logger.debug("Rendering SetupHome with regatta", regatta, "and allRegattas", allRegattas);
    return (
        <Container className="py-6">
            <input ref={fileInputRef} type="file" 
                accept=".json,application/json" style={{display: 'none'}} 
                onChange={importRegattaFromFile} />
            <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4`}>
                <div>
                    <h1 className={`text-2xl font-semibold`}>Regatta configurations</h1>
                    <p className={`text-sm text-gray-500`}>Select an existing configuration or create a new one to begin the wizard.</p>
                </div>
                <div className={`flex gap-2 items-center`}>
                    <button onClick={() => setCreateOpen(true)} className={`px-2 py-1 bg-sky-500 text-white rounded`}>New</button>
                    <button onClick={triggerImportClick} className={`px-2 py-1 bg-sky-500 text-white rounded`}>Import</button>
                    {/* <AuthWidget /> */}
                </div>
            </header>

            <div className={`grid grid-cols-1 gap-4`}>
                <div className='flex gap-2 items-start'>
                        <ListWidget
                            label={`Saved configurations`}
                            items={Object.keys(allRegattas ?? {})}
                            setSelection={(v) => handleSelect(v)}
                            selectedIndex={regatta ? Object.keys(allRegattas ?? {}).indexOf(regatta?.name ?? '') : -1}
                            // selectedItem={regatta?.name ?? null}
                        />
                        {regatta && (
                            <div className={`flex flex-col justify-end gap-2 text-sm `}>
                                <input ref={fileInputRef} type="file" accept=".json,application/json" style={{display: 'none'}} onChange={importRegattaFromFile} />
                                <button onClick={() => {
                                    navigate('/manage');
                                }} className={`px-2 py-1 bg-green-600 text-white rounded`}>Manage races</button>
                                <button onClick={() => {
                                    navigate('/setupboard');
                                }} className={`px-2 py-1 bg-green-600 text-white rounded`}>Setup boat config</button>
                                
                                <button onClick={exportRegattaAsJson} className={`px-2 py-1 bg-blue-500 text-white rounded`}>Export configuration</button>
                                <button onClick={deleteRegatta} className={`px-2 py-1 bg-red-400 text-white rounded`}>Delete configuration</button>
                            </div>
                        )}
                </div>
            </div>

            <CreateRegattaModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
        </Container>
    )
}

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/basic/Container';
// import {useSetupState} from '../context/SetupContext';
import { logger } from '../common/helpers/logger';
import CreateRegattaModal from '../components/complex/modals/CreateRegattaModal';
import { ListWidget } from '../components/complex/widgets/ListWidget';
import { useRegattaState } from '../context/RegattaContext';
import { Regatta } from '../types/RegattaType';

export default function SetupHome() {
    const [allRegattas, setAllRegattas] = useState<Record<string, Regatta> | null>(null)
    const [selectedRegatta, setSelectedRegatta] = useState<string | null>(null);
    const {state: regatta, setState: setRegattaState} = useRegattaState()


    // const [races, setRaces] = useState<Race[]>([]);
    const [createOpen, setCreateOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!allRegattas) {
            logger.debug("Attempting to load regatta configs from localStorage");
            try {
                const raw = localStorage.getItem('regattaConfigs')
                if (raw) {
                    const tree = JSON.parse(raw)
                    setAllRegattas(tree);
                }
            } catch (err) {
                logger.debug('no local races', err)
            }
        }
        return () => {}
    // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (selectedRegatta) {
            logger.debug("Selected regatta", selectedRegatta, "with configs", allRegattas?.[selectedRegatta]);
            setRegattaState(allRegattas?.[selectedRegatta] || { name: selectedRegatta, paddlers: {}, configs: [] });
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
                    const raw = localStorage.getItem('regattaConfigs')
                    const existing = raw ? JSON.parse(raw) : {}
                    existing[parsed.name] = parsed
                    localStorage.setItem('regattaConfigs', JSON.stringify(existing))
                    setAllRegattas(existing)
                } catch (err) {
                    console.error('Failed to persist imported regatta to localStorage', err)
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
            <input ref={fileInputRef} type="file" accept=".json,application/json" style={{display: 'none'}} onChange={importRegattaFromFile} />
            <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4`}>
                <div>
                    <h1 className={`text-2xl font-semibold`}>Regatta configurations</h1>
                    <p className={`text-sm text-gray-500`}>Select an existing configuration or create a new one to begin the wizard.</p>
                </div>
                <div className={`flex gap-2`}>
                    <button onClick={() => setCreateOpen(true)} className={`px-2 py-1 bg-sky-500 text-white rounded`}>New</button>
                    <button onClick={triggerImportClick} className={`px-2 py-1 bg-sky-500 text-white rounded`}>Import</button>
                </div>
            </header>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
                <div className='flex gap-4'>
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

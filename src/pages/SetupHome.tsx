import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSetupState} from '../context/SetupContext';
import {ListWidget} from '../components/complex/widgets/ListWidget';
import CreateRaceModal from '../components/complex/modals/CreateRaceModal';

export default function SetupHome() {
    const [state, setState] = useSetupState()
    const navigate = useNavigate()
    const [createOpen, setCreateOpen] = useState(false)

    useEffect(() => {
        const loadRaces = async () => {
            try {
                const res = await fetch('/api/races')
                if (!res.ok) throw new Error('no backend')
                const data = await res.json()
                if (Array.isArray(data.races)) {
                    const raceList = data.races.map((r: any) => r.name)
                    const configs: any = {}
                    data.races.forEach((r: any) => {
                        configs[r.name] = r.config || {paddlers: {}, configs: []}
                    })
                    setState({...state, raceList, configs})
                } else if (data && typeof data === 'object') {
                    const configs: any = data
                    const raceList = Object.keys(configs)
                    setState({...state, raceList, configs})
                }
            } catch (e) {
                console.debug('Could not load races from backend', e)
            }
        }
        loadRaces()
    // eslint-disable-next-line
    }, [])

    const handleSelect = (value: string) => {
        // set selection and open the board
        setState({...state})
        navigate('/setupboard')
    }

    const handleCreate = async (name: string) => {
        try {
            const res = await fetch('/api/races', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({name})})
            if (res.ok) {
                const created = await res.json()
                const configs = {...state.configs}
                configs[created.name] = created.config || {paddlers: {}, configs: []}
                const raceList = Array.isArray(state.raceList) ? [...state.raceList, created.name] : [created.name]
                setState({...state, configs, raceList})
                // start wizard for the created race
                navigate('/category')
                return
            }
        } catch (e) {
            console.debug('create backend failed', e)
        }

        const configs = {...state.configs}
        configs[name] = {paddlers: {}, configs: []}
        const raceList = Array.isArray(state.raceList) ? [...state.raceList, name] : [name]
        setState({...state, configs, raceList})
        navigate('/category')
    }

    return (
        <div className={`p-6 max-w-[900px] mx-auto`}>
            <header className={`flex items-center justify-between mb-6`}>
                <div>
                    <h1 className={`text-2xl font-semibold`}>Race configurations</h1>
                    <p className={`text-sm text-gray-500`}>Select an existing configuration or create a new one to begin the wizard.</p>
                </div>
                <div>
                    <button onClick={() => setCreateOpen(true)} className={`px-4 py-2 bg-green-500 text-white rounded`}>New configuration</button>
                </div>
            </header>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
                <div>
                    <ListWidget label={`Saved races`} items={state.raceList ?? []} setSelection={(v) => { setState({...state}); setState(s => s); /* noop keep state same */ handleSelect(v) }} selectedIndex={(state.raceList ?? []).indexOf(state?.selected ?? '') + 1} />
                </div>
            </div>

            <CreateRaceModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
        </div>
    )
}

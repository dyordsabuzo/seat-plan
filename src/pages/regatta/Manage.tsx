import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "../../common/helpers/logger";
import { useRegattaState } from "../../context/RegattaContext";
import { PaddlersPanel, RacesPanel } from '../../features/regatta';
import { usePersistentLock } from "../../hooks/usePersistentLock";
import { ActionButton, Breadcrumb, Container, LockStatusBadge, LockToggleCard, SummaryCard, Tabs } from '../../shared';

const Manage: React.FC = () => {
    const {state: regatta} = useRegattaState();
    const [activeTab, setActiveTab] = useState<'races' | 'allocations'>('races')
    const { locked, toggleLocked } = usePersistentLock('regatta-management-lock', false)

    const navigate = useNavigate()

    useEffect(() => {
        logger.debug("SetupBoard mounted with regatta state", regatta)
        if (!regatta) {
            logger.debug("Regatta missing in SetupBoard, redirecting to root")
            navigate('/', { replace: true })
        }
    // eslint-disable-next-line 
    }, [regatta])

    // const handleSaveRace = (row: Race) => {
    //     // update races list locally (not persisted to backend here)
    //     const next = races.map(r => r.id === row.id ? {...r, ...row} : r)
    //     setRaces(next)
    //     // also reflect back into regatta state
    //     setRegatta(prev => ({...prev, races: next}))
    // }

    // const deleteRace = (id: string) => {
    //     logger.debug("Deleting race with id", id)
    //     const remaining = races.filter(r => r.id !== id)
    //     setRaces(remaining);
    //     // also remove from regatta state so allocations columns update
    //     const nextRegattaRaces = (regatta.races || []).filter(r => r.id !== id)
    //     setRegatta(prev => ({...prev, races: nextRegattaRaces}))
    // }

    return (
        <Container className="py-6">
            <div className="space-y-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="mb-4 max-w-[900px]">
                            <Breadcrumb items={[{label: 'Home', to: '/'}]} title="Regatta management" backPath={'/'} />
                        </div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold">{regatta.name}</h1>
                            <LockStatusBadge locked={locked} />
                        </div>
                        <p className="text-sm text-gray-500">Manage races, paddler allocations, and move into boat setup when race data is ready.</p>
                    </div>
                    <div className="flex gap-2">
                        <ActionButton
                            onClick={() => {
                                navigate('/setupboard')
                            }}
                            variant="success"
                        >
                            Go to boat setup
                        </ActionButton>
                        <ActionButton
                            onClick={() => {
                                navigate('/allconfigs')
                            }}
                            variant="primary"
                        >
                            View all configs
                        </ActionButton>
                    </div>
                </header>

                <div className="grid gap-3 sm:grid-cols-3">
                    <SummaryCard label="Races" value={regatta.races?.length ?? 0} />
                    <SummaryCard label="Paddlers" value={regatta.paddlers?.length ?? 0} />
                    <SummaryCard
                        label="Active view"
                        value={locked ? 'Locked' : activeTab === 'races' ? 'Race management' : 'Allocations'}
                        valueClassName="text-sm font-medium text-slate-800"
                    />
                </div>

                <LockToggleCard
                    locked={locked}
                    onToggle={toggleLocked}
                    title="Regatta management lock"
                    lockedDescription="Race and paddler changes are disabled. Unlock to edit."
                    unlockedDescription="Race and paddler changes are enabled. Lock to prevent accidental edits."
                />

                <section className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <Tabs
                            items={[{ key: 'races', label: 'Races' }, { key: 'allocations', label: 'Paddlers & allocations' }]}
                            activeKey={activeTab}
                            onChange={(k) => setActiveTab(k as 'races' | 'allocations')}
                        />
                    </div>

                    <div id="tabpanel-races" role="tabpanel" aria-labelledby="tab-races" hidden={activeTab !== 'races'}>
                        <RacesPanel locked={locked} />
                    </div>

                    <div id="tabpanel-allocations" role="tabpanel" aria-labelledby="tab-allocations" hidden={activeTab !== 'allocations'} className="my-6">
                        <PaddlersPanel locked={locked} />
                    </div>
                </section>
            </div>
        </Container>
    )
}

export default Manage;
import { useEffect } from "react";
import { logger } from "../../common/helpers/logger";
import Breadcrumb from "../../components/basic/Breadcrumb";
import { useRegattaState } from "../../context/RegattaContext";
// import Tabs from "../../refactor/Tabs";
import { useNavigate } from "react-router-dom";
import Container from '../../components/basic/Container';
import PaddlersPanel from '../../components/complex/PaddlersPanel';
import RacesPanel from '../../components/complex/RacesPanel';

const Manage: React.FC = () => {
    const {state: regatta} = useRegattaState();

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
        <div className={`flex flex-col gap-4`}>
            <Container className="py-6">
                <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6`}>
                    <div>
                        <div className="mb-4 max-w-[900px]">
                            <Breadcrumb items={[{label: 'Home', to: '/'}]} title="Regatta management" backPath={'/'} />
                        </div>
                        <h1 className={`text-2xl font-semibold`}>Regatta management</h1>
                        <p className={`text-sm text-gray-500`}>Manage races and race allocations</p>
                        <p className={`text-sm text-gray-900 font-semibold py-2`}>{regatta.name}</p>
                    </div>
                    <div className="">
                        <button onClick={() => {
                            navigate('/setupboard')
                        }} className={`px-4 py-2 bg-green-500 text-white rounded`}>Go to boat setup</button>
                    </div>
                </header>
                <div>
                    <RacesPanel />
                </div>
                <div className="my-6">
                    <PaddlersPanel />
                </div>

            </Container>
        </div>
    )
}

export default Manage;
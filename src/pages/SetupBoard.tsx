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
                    <div className={`w-full`}>
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
                        <div className={`w-full`}>
                            {race && (
                                <RaceBoard race={race} onUpdateConfig={handleUpdateConfig} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Container>
    )
};

export default SetupBoard;
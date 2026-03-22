import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "../common/helpers/logger";
import Container from '../components/basic/Container';
import RaceBoard from "../components/board/RaceBoard";
import ExportRacesModal from "../components/complex/modals/ExportRacesModal";
import { ListWidget } from "../components/complex/widgets/ListWidget";
import { BoardViewProvider } from "../context/BoardViewContext";
import { useRegattaState } from "../context/RegattaContext";
import { Race } from "../types/RegattaType";

export function SetupBoard() {
    const {state: regatta} = useRegattaState();
    const [selection, setSelection] = useState<string | null>(null)
    const [race, setRace] = useState<Race|null>(null)
    const [showExport, setShowExport] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        logger.debug("SetupBoard mounted with regatta state", regatta)
        if (!regatta) {
            logger.debug("Regatta missing in SetupBoard, redirecting to root")
            navigate('/', { replace: true })
        }
    // eslint-disable-next-line 
    }, [regatta])

    if (race) {
        race.configs = race.configs.map((cfg: any) => {
            if (typeof cfg === 'string') {
                try {
                    return JSON.parse(cfg)
                } catch (e) {
                    logger.debug("Failed to parse config string, using as-is", {cfg, error: e})
                    return cfg
                }
            }
            return cfg
        });
    }

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
        <BoardViewProvider>
            <Container className="h-full">
                <div className={`flex flex-col lg:flex-row gap-6`}> 
                    {regatta && (
                        <div className={`w-full`}>
                            <h1 className="py-2">{regatta.name}</h1>
                            <div className="flex items-end gap-2 w-full">
                                <ListWidget label={"Race listing"}
                                            items={regatta.races.map(config => `${config.category}-${config.type}-${config.distance}-${config.boatType}`) ?? []}
                                            selectedIndex={selection ? regatta.races?.findIndex(config => `${config.category}-${config.type}-${config.distance}-${config.boatType}` === selection) : -1}
                                            setSelection={handleSelection}
                                />
                                {/* <button className="px-3 py-1 border rounded text-sm" onClick={() => setShowExport(true)}>Export PDF</button> */}
                            </div>
                            <div className={`w-full`}>
                                {race && (
                                    <RaceBoard race={race} onUpdateConfig={handleUpdateConfig} />
                                )}
                            </div>
                            {showExport && <ExportRacesModal races={regatta.races} onClose={() => setShowExport(false)} />}
                        </div>
                    )}
                </div>
            </Container>
        </BoardViewProvider>
    )
};

export default SetupBoard;
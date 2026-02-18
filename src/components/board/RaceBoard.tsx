import { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { BoatLabel, BoatPosition, BoatSize } from "../../enums/BoatConstant";
// import {calculateLineBalance, calculateSideBalance} from "../../utils/WeightCalculator";
import { logger } from "../../common/helpers/logger";
import { useRegattaState } from '../../context/RegattaContext';
import { Race } from "../../types/RegattaType";
import { getItems, move, reorder } from "../../utils/ConfigurationHelper";
import { HeaderButtonsWidget } from "../complex/widgets/HeaderButtonsWidget";
import ConfigSection from "./ConfigSection";
import { ReserveSection } from "./sections/ReserveSection";

const initialiseBoard = (paddlers: any, boatType) => {
    const boatSize = BoatSize[boatType.toUpperCase()]

    return [
        getItems(1, 0, "scratch"),
        paddlers,
        getItems(1, 1, "drummer"),
        getItems(boatSize, boatSize, "left"),
        getItems(boatSize, boatSize, "right"),
        getItems(1, 1, "sweep")
    ]
}

type Props = {
    race: Race,
    onUpdateConfig?: (index, config) => void,
    onAddPaddler?: (paddler: any) => void,
    selectedRace?: string
}

export default function RaceBoard({race, onUpdateConfig, onAddPaddler, selectedRace}: Props) {
    const [selectedConfigIndex, setSelectedConfigIndex] = useState(null)
    const [configNames, setConfigNames] = useState<string[]>(race.configs.length < 2 ? ["Config 1"] : race.configs.map((_, index) => `Config ${index + 1}`))
    const [boardSetup, setBoardSetup] = useState<any>(null)
    // const [showWeights, setShowWeights] = useState(true)
    // const {setting, setSetting} = useSetupState();

    const {updateRaceConfig} = useRegattaState()

    useEffect(() => {
        setSelectedConfigIndex(null);
        setConfigNames(race.configs.length === 0 ? ["Config 1"] : race.configs.map((_, index) => `Config ${index + 1}`));
        return () => {};
    }, [race]);
    
    useEffect(() => {
        logger.debug("PRE Board setup changed", boardSetup, selectedConfigIndex, race);
        race.configs[selectedConfigIndex] = boardSetup;
        updateRaceConfig(race);
        logger.debug("POST Board setup changed", boardSetup, selectedConfigIndex, race);
        return () => {};
    // eslint-disable-next-line 
    }, [boardSetup]);

    const paintRaceConfig = (configIndex: number) => {
        if (race.configs.length < 1) {
            logger.debug("Empty race configurations", race.configs, configIndex)
            const config = initialiseBoard(race.paddlers.map((p: any) => {
                // const content = showWeights ? `${p.name} (${p.weight})` : p.name
                const content = `${p.name} (${p.weight})`;
                return {...p, content: content}
            }), race.boatType)
            race.configs = [config];
            logger.debug("Updated race configurations", race.configs)
        }
    }

    useEffect(() => {
        if (selectedConfigIndex !== null) {
            logger.debug("Selected config index changed", selectedConfigIndex, race)            
            paintRaceConfig(selectedConfigIndex);
        }
        setBoardSetup(race.configs[selectedConfigIndex]);
    // eslint-disable-next-line 
    }, [selectedConfigIndex]);

    const onDragEnd = (result: any) => {
        const {source, destination} = result;

        // dropped outside the list
        if (!destination) {
            return;
        }
        const sInd = +source.droppableId;
        const dInd = +destination.droppableId;

        if (sInd === dInd) {
            const items = reorder(boardSetup[sInd], source.index, destination.index);
            const newState: any = [...boardSetup];
            newState[sInd] = items;
            onUpdateConfig(selectedConfigIndex, newState)
            setBoardSetup(newState);
        } else {
            const result = move(boardSetup[sInd], boardSetup[dInd], source, destination);

            const newState = [...boardSetup];

            newState[sInd] = result[sInd];
            newState[dInd] = result[dInd];

            // put displaced item back to reserved
            if (result["displaced"]) {
                newState[BoatPosition.RESERVE.toString()].push(result["displaced"])
            }

            onUpdateConfig(selectedConfigIndex, newState.filter(group => group.length));
            setBoardSetup(newState.filter(group => group.length));
        }
    }

    const putOnReserve = (object: any, positionId: number, index: number) => {
        const newState = [...boardSetup];
        newState[positionId].splice(index, 1);
        newState[positionId].splice(index, 0, {
            id: `empty-${index}-${new Date().getTime()}`,
            name: BoatLabel.EMPTY_SEAT,
            content: BoatLabel.EMPTY_SEAT,
            weight: 0
        })
        newState[BoatPosition.RESERVE].splice(0, 0, object)
        setBoardSetup(newState)
    }

    return (
        <div className={`flex flex-col`}>
            <div className="flex items-center gap-4 mt-4">
                <span className={`text-sm text-gray-800`}>
                    {`${race.category} ${race.type} ${race.distance} ${race.boatType}`}
                </span>
                <button onClick={() => {
                    // Save logic here
                }} className={`text-sm text-blue-500 border border-blue-500 rounded px-2 py-1`}>Save</button>
                <button onClick={() => {
                    race.configs = [];
                    setSelectedConfigIndex(null);
                }}
                className={`text-sm text-blue-500 border border-blue-500 rounded px-2 py-1`}>Reset configs</button>
                {/* <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={showWeights}
                        onChange={e => setShowWeights(e.target.checked)}
                    />
                    <span className="text-sm text-gray-800">Show Weights</span>
                </label> */}
            </div>

            <HeaderButtonsWidget names={configNames}
                    clickedIndex={selectedConfigIndex}
                    onClick={setSelectedConfigIndex}
                    addHeaderHandler={() => setConfigNames([
                        ...configNames,
                        `Config ${configNames.length + 1}`
                    ])}
            />

            {boardSetup && (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className={`flex items-start`}>
                        <ReserveSection section={boardSetup[BoatPosition.RESERVE]} onAddPaddler={onAddPaddler} />
                        <ConfigSection boardSetup={boardSetup} boatType={race.boatType} onButtonClick={putOnReserve} />
                    </div>
                </DragDropContext>
            )}
        </div>
    );
}


import React, {useEffect, useState} from "react";
import {DragDropContext} from "react-beautiful-dnd";
import {BoatLabel, BoatPosition, BoatSize} from "../../enums/BoatConstant";
// import {calculateLineBalance, calculateSideBalance} from "../../utils/WeightCalculator";
import {getItems, move, reorder} from "../../utils/ConfigurationHelper";
import {ReserveSection} from "./sections/ReserveSection";
import ConfigSection from "./ConfigSection";
import {HeaderButtonsWidget} from "../complex/widgets/HeaderButtonsWidget";
import {useRegattaState} from '../../context/RegattaContext'
import { logger } from "../../common/helpers/logger";
import { BasicButton } from "../basic/buttons/BasIcButton";
import { SelectionButton } from "../basic/buttons/SelectionButton";
import { useSetupState } from "../../context/SetupContext";
import { calculateLineBalance, calculateSideBalance } from "../../utils/WeightCalculator";
import { Race } from "../../types/RegattaType";

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
    const [configNames, setConfigNames] = useState<string[]>(["Default Config"])
    const [boardSetup, setBoardSetup] = useState<any>(null)
    const {setting, setSetting} = useSetupState();

    useEffect(() => {
        setSelectedConfigIndex(null);
        return () => {};
    }, [race]);

    useEffect(() => {
        if (selectedConfigIndex !== null) {
            logger.debug("Selected config index changed", selectedConfigIndex, race)
            if (race.configs.length > 0) {
                logger.debug("Race configurations", race.configs)
                if (selectedConfigIndex <= race.configs.length - 1) {
                    const config = initialiseBoard(race.paddlers.map((p: any) => ({...p, content: `${p.name} (${p.weight})`})), race.boatType);
                    race.configs.push(config);
                }
            } else {
                const config = initialiseBoard(race.paddlers.map((p: any) => ({...p, content: `${p.name} (${p.weight})`})), race.boatType)
                race.configs = [config];
            }
            logger.debug("Updated race configurations", race.configs)
        }
        setBoardSetup(race.configs[selectedConfigIndex]);
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

    // useEffect(() => {
    //     if (selectedConfigIndex !== null) {
    //         // const settings = {
    //         //     ...state.settings,
    //         //     sideWeightFactor: state.settings?.sideWeightFactor[state.boatSize?.toUpperCase()],
    //         //     lineWeightFactor: state.settings?.lineWeightFactor[state.boatSize?.toUpperCase()]
    //         // }
    
    //         logger.debug("Calculating balance with settings", boardSetup, setting)
    //         const sideBalance = calculateSideBalance(boardSetup, setting)
    //         const lineBalance = calculateLineBalance(boardSetup, setting)
    
    //         // setStats({
    //         //     sideBalance,
    //         //     lineBalance
    //         // });
    //         logger.debug("Calculated balance", {sideBalance, lineBalance})
    //     }
    //     return () => {
    //     }
    // }, [boardSetup]);

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

    logger.debug("Board setup for config", selectedConfigIndex, boardSetup, race);

    return (
        <div className={`flex flex-col`}>
            <div className="flex items-center gap-4 mt-4">
                <span className={`text-sm text-gray-800`}>
                    {`${race.category} ${race.type} ${race.distance} ${race.boatType}`}
                </span>
                <button className={`text-sm text-blue-500 border border-blue-500 rounded px-2 py-1`}>Save</button>
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


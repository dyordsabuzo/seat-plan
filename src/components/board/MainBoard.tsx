import React, {useEffect, useState} from "react";
import {DragDropContext} from "react-beautiful-dnd";
import {BoatLabel, BoatPosition, BoatSize} from "../../enums/BoatConstant";
// import {calculateLineBalance, calculateSideBalance} from "../../utils/WeightCalculator";
import {getItems, move, reorder} from "../../utils/ConfigurationHelper";
import {ReserveSection} from "./sections/ReserveSection";
import ConfigSection from "./ConfigSection";
import {HeaderButtonsWidget} from "../complex/widgets/HeaderButtonsWidget";

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
    boardConfigs: any
    boardProperties: any
        onUpdateConfig?: (index, config) => void
        onAddPaddler?: (paddler: any) => void
}

export default function MainBoard({boardConfigs, boardProperties, onUpdateConfig, onAddPaddler}: Props) {
    // const [state, setState] = useSetupState()
    const [selectedConfig, setSelectedConfig] = useState(0)
    const [boardSetup, setBoardSetup] = useState<any>([])
    const [configNames, setConfigNames] = useState<string[]>(["Default Config"])
    const {ageCategory, genderCategory, distance, boatType} = boardProperties
    // const [stats, setStats] = useState<any>({})

    // page is re-rendered becaus of multiple dependencies
    useEffect(() => {
        const {paddlers, configs} = boardConfigs
        if (configs.length >= selectedConfig + 1) {
            setBoardSetup(boardConfigs.configs[selectedConfig])
        } else {
            setBoardSetup(initialiseBoard(
                Object.keys(paddlers).map(p => {
                    return {
                        ...paddlers[p],
                        content: paddlers[p].name
                    }
                }),
                boatType
            ))
        }

    }, [boardConfigs, selectedConfig, boatType]);

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
            onUpdateConfig(selectedConfig, newState)
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

            onUpdateConfig(selectedConfig, newState.filter(group => group.length));
            setBoardSetup(newState.filter(group => group.length));
        }
    }

    // useEffect(() => {
    //     if (boardSetup) {
    //         const settings = {
    //             ...state.settings,
    //             sideWeightFactor: state.settings?.sideWeightFactor[state.boatSize?.toUpperCase()],
    //             lineWeightFactor: state.settings?.lineWeightFactor[state.boatSize?.toUpperCase()]
    //         }
    //
    //         const sideBalance = calculateSideBalance(boardSetup, settings)
    //         const lineBalance = calculateLineBalance(boardSetup, settings)
    //
    //         setStats({
    //             sideBalance,
    //             lineBalance
    //         });
    //     }
    //     return () => {
    //     }
    // }, [boardSetup]);

    const putOnReserve = (object: any, positionId: number, index: number) => {
        const newState = [...boardSetup];
        newState[positionId].splice(index, 1);
        newState[positionId].splice(index, 0, {
            id: `empty-${index}-${new Date().getTime()}`,
            content: BoatLabel.EMPTY_SEAT
        })
        newState[BoatPosition.RESERVE].splice(0, 0, object)
        setBoardSetup(newState)
    }

    console.log(boardSetup, boardConfigs, selectedConfig)

    return (
        <div className={`flex flex-col items-center`}>
            <h1 className={`w-full flex py-3 font-semibold`}>
                {`${ageCategory} ${genderCategory} ${distance} ${boatType}`}
            </h1>
            <HeaderButtonsWidget names={configNames}
                                 clickedIndex={selectedConfig}
                                 onClick={setSelectedConfig}
                                 addHeaderHandler={() => setConfigNames([
                                     ...configNames,
                                     `Config ${configNames.length + 1}`
                                 ])}
            />
            <DragDropContext onDragEnd={onDragEnd}>
                <div className={`flex items-start`}>
                    <ReserveSection section={boardSetup[BoatPosition.RESERVE]} onAddPaddler={onAddPaddler} />
                    <ConfigSection drummerSection={boardSetup[BoatPosition.DRUMMER]}
                                   leftSection={boardSetup[BoatPosition.LEFT]}
                                   rightSection={boardSetup[BoatPosition.RIGHT]}
                                   sweepSection={boardSetup[BoatPosition.SWEEP]}
                                   onButtonClick={putOnReserve}
                    />
                </div>
            </DragDropContext>
        </div>
    );
}


import { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { DrummerSection } from "../components/board/sections/DrummerSection";
import { PaddleSection } from "../components/board/sections/PaddleSection";
import { ReserveSection } from "../components/board/sections/ReserveSection";
import { SweepSection } from "../components/board/sections/SweepSection";
import DraggablePaddler from "../components/complex/drag-and-drop/DraggablePaddler";
import DroppablePosition from "../components/complex/drag-and-drop/DroppablePosition";
import { useSetupState } from "../context/SetupContext";
import { BoatPosition, BoatSize } from "../enums/BoatConstant";
import { getItems, move, reorder } from "../utils/ConfigurationHelper";
import { calculateLineBalance, calculateSideBalance } from "../utils/WeightCalculator";


export default function BoatConfiguration() {
    // const boatContext = useContext(BoatContext);
    const [state, setState] = useSetupState()

    const [boatSetup, setBoatSetup] = useState([
        getItems(1, 0, "scratch")
    ])
    const [stats, setStats] = useState<any>({})

    const onDragEnd = (result: any) => {
        const {source, destination} = result;

        // dropped outside the list
        if (!destination) {
            return;
        }
        const sInd = +source.droppableId;
        const dInd = +destination.droppableId;

        if (sInd === dInd) {
            const items = reorder(boatSetup[sInd], source.index, destination.index);
            const newState: any = [...boatSetup];
            newState[sInd] = items;
            setBoatSetup(newState);
        } else {
            const result = move(boatSetup[sInd], boatSetup[dInd], source, destination);

            const newState = [...boatSetup];

            newState[sInd] = result[sInd];
            newState[dInd] = result[dInd];

            // put displaced item back to reserved
            if (result["displaced"]) {
                newState[BoatPosition.RESERVE.toString()].push(result["displaced"])
            }

            setBoatSetup(newState.filter(group => group.length));
        }
    }

    useEffect(() => {
        // let paddlers = Object.values(boatContext.paddlers as any);
        let paddlers = state.paddlers
        const list: any = Array.from(paddlers.map((paddler: any) => ({
            ...paddler,
            content: paddler.name
        })))

        const boatSize = state.boatSize === "Standard" ? BoatSize.STANDARD : BoatSize.SMALL

        setBoatSetup([
            getItems(1, 0, ""),
            list,
            getItems(1, 1, "drummer"),
            getItems(boatSize, boatSize, "left"),
            getItems(boatSize, boatSize, "right"),
            getItems(1, 1, "sweep")])
    }, [state]);

    useEffect(() => {
        const settings = {
            ...state.settings,
            sideWeightFactor: state.settings?.sideWeightFactor[state.boatSize.toUpperCase()],
            lineWeightFactor: state.settings?.lineWeightFactor[state.boatSize.toUpperCase()]
        }

        console.log(settings)

        const sideBalance = calculateSideBalance(boatSetup, settings)
        const lineBalance = calculateLineBalance(boatSetup, settings)

        setStats({
            sideBalance,
            lineBalance
        });
    }, [boatSetup]);

    const putOnReserve = (object: any, positionId: number, index: number) => {
        const newState = [...boatSetup];
        newState[positionId].splice(index, 1);

        newState[positionId].splice(index, 0, {
            id: `empty-${index}-${new Date().getTime()}`,
            content: 'Empty Seat',
            weight: 0
        })

        newState[BoatPosition.RESERVE].splice(0, 0, object)
        setBoatSetup(newState)
    }

    const getDroppableSection = (id: number, label?: string) => {
        if (boatSetup[id]) {
            return (
                <DroppablePosition section={boatSetup[id]} id={id}
                                   key={id}
                                   label={label}>
                    {boatSetup[id].map((item, index) => (
                        <DraggablePaddler key={item.id}
                                          item={item}
                                          index={index}
                                          position={id}
                                          putOnReserve={putOnReserve}/>
                    ))}
                </DroppablePosition>
            )
        }
    }

    return (
        <div className={`w-full flex justify-center`}>
            <div className={`w-full flex justify-center relative`}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className={`flex flex-row`}>
                        <ReserveSection section={boatSetup[BoatPosition.RESERVE]}/>
                        <div className={`flex flex-col items-center gap-3`}>
                            <DrummerSection section={boatSetup[BoatPosition.DRUMMER]}/>
                            <PaddleSection leftSection={boatSetup[BoatPosition.LEFT]}
                                        rightSection={boatSetup[BoatPosition.RIGHT]}/>
                            <SweepSection section={boatSetup[BoatPosition.SWEEP]}/>
                        </div>
                    </div>
                </DragDropContext>

                {/*<DragDropContext onDragEnd={onDragEnd}>*/}
                {/*    /!*<div className={`absolute -left-11 md:left-24 flex py-4 mr-1 md:mr-8`}>*!/*/}
                {/*    <div className={`flex`}>*/}
                {/*        {getDroppableSection(BoatPosition.RESERVE, "Reserves")}*/}
                {/*    </div>*/}

                {/*    /!*<div className={`absolute left-28 top-12 md:left-[20rem]`}>*!/*/}
                {/*    <div className={`flex justify-center`}>*/}
                {/*        <div className={`relative flex justify-center`}>*/}
                {/*            /!*horizontal gauge*!/*/}
                {/*            <LinearGauge GHeight={300}*/}
                {/*                         GWidth={5}*/}
                {/*                         horizontal={true}*/}
                {/*                         value={stats.sideBalance?.value ?? 0}*/}
                {/*                         toleranceMin={-5}*/}
                {/*                         toleranceMax={5}*/}
                {/*                         textValue={`${stats.sideBalance?.value ?? "0"} kg`}*/}
                {/*            />*/}
                {/*            /!*vertical guage*!/*/}
                {/*            <LinearGauge GHeight={400}*/}
                {/*                         GWidth={5}*/}
                {/*                         value={stats.lineBalance?.value ?? 0}*/}
                {/*                         toleranceMin={-25}*/}
                {/*                         toleranceMax={15}*/}
                {/*                         textValue={`${stats.lineBalance?.value ?? "0"} kg`}*/}
                {/*            />*/}
                {/*            <div className={`flex flex-col items-center m-8 py-8 `}>*/}
                {/*                {getDroppableSection(BoatPosition.DRUMMER)}*/}
                {/*                /!* the round drum *!/*/}
                {/*                <div className={`*/}
                {/*                text-gray-900 ring-2 ring-slate-200 */}
                {/*                dark:focus:ring-teal-700 */}
                {/*                rounded-full p-2 w-12 h-12*/}
                {/*            `}></div>*/}

                {/*                <div className={`flex justify-center`}>*/}
                {/*                    {boatSetup.map((el, id) => (*/}
                {/*                        (id > BoatPosition.DRUMMER && id < BoatPosition.SWEEP && (*/}
                {/*                            getDroppableSection(id)*/}
                {/*                        ))))}*/}
                {/*                </div>*/}

                {/*                {getDroppableSection(BoatPosition.SWEEP)}*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*    /!*<div className={`*!/*/}
                {/*    /!*    absolute left-[17.5rem] md:left-[31rem] -top-[5.15rem]*!/*/}
                {/*    /!*`}>*!/*/}
                {/*    /!*    <LinearGauge GHeight={300}*!/*/}
                {/*    /!*                 GWidth={5}*!/*/}
                {/*    /!*                 horizontal={true}*!/*/}
                {/*    /!*                 value={stats.sideBalance?.value ?? 0}*!/*/}
                {/*    /!*                 toleranceMin={-5}*!/*/}
                {/*    /!*                 toleranceMax={5}*!/*/}
                {/*    /!*                 textValue={`${stats.sideBalance?.value ?? "0"} kg`}*!/*/}
                {/*    /!*    />*!/*/}
                {/*    /!*</div>*!/*/}
                {/*    /!*<div className={`*!/*/}
                {/*    /!*    absolute left-[27.25rem] md:left-[43.5rem] top-[5.5rem]*!/*/}
                {/*    /!*`}>*!/*/}
                {/*    /!*    <LinearGauge GHeight={400}*!/*/}
                {/*    /!*                 GWidth={5}*!/*/}
                {/*    /!*                 value={stats.lineBalance?.value ?? 0}*!/*/}
                {/*    /!*                 toleranceMin={-25}*!/*/}
                {/*    /!*                 toleranceMax={15}*!/*/}
                {/*    /!*                 textValue={`${stats.lineBalance?.value ?? "0"} kg`}*!/*/}
                {/*    /!*    />*!/*/}
                {/*    /!*</div>*!/*/}
                {/*</DragDropContext>*/}
            </div>
        </div>
    )
        ;
}


import { DragDropContext } from "react-beautiful-dnd";
import Boat from "../boat/Boat";
import PaddlerList from "./PaddlerList";
import SourceDrop from "../../components/complex/drag-and-drop/SourceDrop";
import {useCallback, useContext, useEffect, useState} from "react";
import BoatContext from "../../context/BoatContext";
import { RaceType } from "../../types/RaceType";
import BoatStats from "../misc/BoatStats";

const Setup = () => {
    const boatContext = useContext(BoatContext);
    const [selectedRace, setSelectedRace] = useState(boatContext.selectedRace);
    
    const onDragEnd = (result: any) => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // let selectedRace = boatContext.selectedRace;
        // let setup = {
        //     ...(selectedRace as RaceType).setup,
        //     [destination.droppableId]: draggableId
        // }

        // selectedRace = {
        //     ...selectedRace,
        //     setup: setup
        // }

        boatContext.updateRaceCategory(destination, source, draggableId);
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={`flex gap-8 p-4`}>
                <div className={`w-52`}>
                    {/* <SourceDrop id={"main"} data={Object.values(boatContext.paddlers as any)} /> */}
                    <SourceDrop id={"main"} data={(selectedRace as RaceType).sourcePaddlers} />
                </div>
                <div className={`flex-col gap-2`}>
                    <Boat />
                </div>
                <div>
                    <BoatStats />
                </div>
            </div>
        </DragDropContext>
    );
}

export default Setup;
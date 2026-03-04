import { useContext } from 'react';
import DragDropContextWrapper from '../../components/DragDropContextWrapper';
import SourceDrop from "../../components/complex/drag-and-drop/SourceDrop";
import BoatContext from "../../context/BoatContext";
import { RaceType } from "../../types/RaceType";
import Boat from "../boat/Boat";
import BoatStats from "../misc/BoatStats";


const Setup = () => {
    const boatContext = useContext(BoatContext);
    const selectedRace = boatContext?.selectedRace ?? null;
    
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
        <DragDropContextWrapper onDragEnd={onDragEnd}>
            <div className={`flex gap-8 p-4`}>
                <div className={`w-52`}>
                    {/* <SourceDrop id={"main"} data={Object.values(boatContext.paddlers as any)} /> */}
                    <SourceDrop id={"main"} data={((selectedRace as RaceType)?.sourcePaddlers) ?? []} />
                </div>
                <div className={`flex-col gap-2`}>
                    <Boat />
                </div>
                <div>
                    <BoatStats />
                </div>
            </div>
        </DragDropContextWrapper>
    );
}

export default Setup;
import { Droppable } from "react-beautiful-dnd";
import Paddler from "../../../refactor/Paddler";
import { PaddlerType } from "../../../types/PaddlerType";
import PaddlerDrag from "./PaddlerDrag";
import { useEffect, useState } from "react";

type SourceDropType = {
    id: string,
    data: any
}

const SourceDrop: React.FC<SourceDropType> = ({ id, data }) => {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));

        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        }
    }, []);

    if (!enabled) {
        return null;
    }

    return (
        <div className={`
            m-0.5 border-solid border border-black 
            rounded-sm flex flex-col
        `}>
            <Droppable droppableId={id} >
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-2 transition-all 
                           flex flex-col gap-2
                           ${snapshot.isDraggingOver ? "bg-slate-600" : "bg-white"}
                        `}
                    >
                        {data.map((paddler: PaddlerType, index: number) => (
                            <PaddlerDrag key={paddler.id} paddler={paddler} index={index} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    )
}

export default SourceDrop;
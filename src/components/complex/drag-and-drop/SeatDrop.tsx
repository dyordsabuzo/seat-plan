import { Droppable } from "react-beautiful-dnd";
import { PaddlerType } from "../../../types/PaddlerType";
import Paddler from "../../../refactor/Paddler";
import { useEffect, useState } from "react";

type SeatDropType = {
    id: string,
    paddler: PaddlerType
}

const SeatDrop: React.FC<SeatDropType> = ({ id, paddler }) => {
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
        <Droppable droppableId={id} >
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                            p-2 transition-all h-12
                           ${snapshot.isDraggingOver ? "bg-slate-600" : "bg-amber-500"}
                        `}
                >
                    {paddler && <Paddler paddler={paddler} index={0} draggable={true} />}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    )
}

export default SeatDrop;
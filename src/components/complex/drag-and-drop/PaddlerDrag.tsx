import { Draggable } from "react-beautiful-dnd";
import { PaddlerType } from "../../../types/PaddlerType";

type PaddlerDragType = {
    paddler: PaddlerType,
    index: number
}

const PaddlerDrag: React.FC<PaddlerDragType> = ({ paddler, index }) => {
    return (
        <Draggable draggableId={paddler.id as string} index={index}>
            {(provided, snapshot) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    className={`border border-solid border-black 
                                rounded-md p-px px-2 py-2 transition-all text-sm
                                ${snapshot.isDragging ? "bg-slate-300" : "bg-white"}
                            `}>
                    {`${paddler.name} (${paddler.weight})`}
                </div>
            )}
        </Draggable>
    )
}

export default PaddlerDrag;
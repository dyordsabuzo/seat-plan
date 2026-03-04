import { PaddlerType } from "../../../types/PaddlerType";
import { Draggable } from '../../DragDropWrappers';

type PaddlerDragType = {
    paddler: PaddlerType,
    index: number
}

const PaddlerDrag: React.FC<PaddlerDragType> = ({ paddler, index }) => {
    return (
        <Draggable draggableId={String(paddler.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    style={{ ...(provided.draggableProps.style as any) }}
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
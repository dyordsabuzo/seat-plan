import { ReactNode } from "react";
import { Droppable } from '../../DragDropWrappers';

type Props = {
    section: any
    id: number
    label?: string
    children: ReactNode
}

export default function DroppablePosition({section, id, label, children}: Props) {
    return (
        <div>
            {label && <h1 className={`font-bold flex justify-center py-2`}>{label}</h1>}

            <Droppable key={id} droppableId={`${id}`}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-col items-start py-1 w-[9.5rem] ${snapshot.isDraggingOver ? "bg-[lightblue]" : ""}`}
                        style={{ minHeight: Math.max(4, (section?.length ?? 0)) * 56 }}
                    >
                        {children}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    )
}
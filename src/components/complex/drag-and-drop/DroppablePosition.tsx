import {Droppable} from "react-beautiful-dnd";
import React, {ReactNode} from "react";

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
                        className={`
                        flex flex-col items-center
                        py-1 w-[9.5rem]
                        ${snapshot.isDraggingOver ? "bg-[lightblue]" : ""}
                    `}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {children}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    )
}
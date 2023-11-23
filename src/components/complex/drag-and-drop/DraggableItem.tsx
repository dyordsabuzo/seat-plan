import {Draggable} from "react-beautiful-dnd";
import React from "react";
import {LabelWidget} from "../widgets/LabelWidget";
import {BoatLabel} from "../../../enums/BoatConstant";

type Props = {
    item: any
    index: number
    position: number
    defaultLabel?: string
    onButtonClick?: (item: any, positionId: number, index: number) => void
}

export default function DraggableItem({item, index, position, defaultLabel = "", onButtonClick = null}: Props) {
    const clickHandler = () => {
        onButtonClick(item, position, index)
    }

    return (
        <Draggable
            draggableId={item.id}
            index={index}
        >
            {(provided, snapshot) => (
                <div
                    className={`
                        w-[9rem] text-gray-900 ring-2 ring-slate-200 
                        dark:focus:ring-teal-700 font-medium rounded-lg text-sm 
                        p-2 text-center
                        ${snapshot.isDragging ? "bg-[lightgreen]" : ""}
                        ${item.content === defaultLabel ? "bg-white" : "pl-10 md:px-5 bg-red-100"}
                    `}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <LabelWidget label={item.content ?? defaultLabel}
                                 onClick={item.content !== defaultLabel && onButtonClick ? clickHandler : null}
                    />
                </div>
            )}
        </Draggable>
    )
}

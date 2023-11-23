import {Draggable} from "react-beautiful-dnd";
import React from "react";
import {BoatPosition} from "../../../enums/BoatConstant";

type Props = {
    item: any
    index: number
    position: number
    putOnReserve?: (item: any, positionId: number, index: number) => void
}

export default function DraggablePaddler({item, index, position, putOnReserve}: Props) {
    return (
        <Draggable
            draggableId={item.id}
            index={index}
        >
            {(provided, snapshot) => (
                <div
                    className={`
                        w-[9rem] my-2 text-gray-900 ring-2 ring-slate-200 
                        dark:focus:ring-teal-700 font-medium rounded-lg text-sm 
                        py-2.5 text-center
                        ${snapshot.isDragging ? "bg-[lightgreen]" : ""}
                        ${item.content === "Empty Seat" ? "bg-white" : "pl-10 md:px-5 bg-red-100"}
                    `}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <div className={`
                            flex  relative
                            ${item.content === "Empty Seat" ? "justify-center" : "justify-between"}
                        `}>
                        {item.content}
                        {(item.content !== "Empty Seat" && position !== BoatPosition.RESERVE) && (
                            <button
                                type="button"
                                className={`absolute -right-3 -top-1`}
                                onClick={() => {
                                    putOnReserve(item, position, index)
                                }}>
                                <span className={`text-xs text-gray-400`}>X</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    )
}

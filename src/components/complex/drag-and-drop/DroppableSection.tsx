import {Droppable} from "react-beautiful-dnd";
import DraggableItem from "./DraggableItem";

type Props = {
    section: any
    id: number
    defaultItemLabel?: string
    mainClassName?: string
    sectionClassName?: string
    onItemButtonClick?: (item: any, positionId: number, index: number) => void
}

export default function DroppableSection({
                                             section,
                                             id,
                                             defaultItemLabel,
                                             mainClassName = "",
                                             sectionClassName = "",
                                             onItemButtonClick = null
                                         }: Props) {
    return (
        <div className={mainClassName}>
            <Droppable key={id} droppableId={`${id}`}>
                {(provided, snapshot) => (
                    <div className={`
                        flex flex-col items-center gap-3
                        ${sectionClassName}
                        ${snapshot.isDraggingOver ? "bg-[lightblue]" : ""}
                    `}
                         ref={provided.innerRef}
                         {...provided.droppableProps}
                    >
                        {section && section.map((item, index) => (
                            <DraggableItem key={item.id}
                                           item={item}
                                           index={index}
                                           position={id}
                                           defaultLabel={defaultItemLabel}
                                           onButtonClick={onItemButtonClick}
                            />
                        ))}

                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    )
}
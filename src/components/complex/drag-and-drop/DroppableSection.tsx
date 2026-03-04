import { Droppable } from '../../DragDropWrappers';
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
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-col items-start gap-3 ${sectionClassName} ${snapshot.isDraggingOver ? "bg-[lightblue]" : ""}`}
                        style={{ minHeight: Math.max(4, (section?.length ?? 0)) * 56 }}
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
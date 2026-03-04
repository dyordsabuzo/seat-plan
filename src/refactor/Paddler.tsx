import { Draggable } from '../components/DragDropWrappers';

type PaddlerProps = {
    paddler: any,
    index: number,
    draggable: boolean
}

const Paddler: React.FC<PaddlerProps> = ({ paddler, index, draggable }) => {

    return (
        <div>
            {draggable && (
                <Draggable draggableId={String(paddler.id)} index={index}>
                    {(provided, snapshot) => (
                        <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            style={{ ...(provided.draggableProps.style as any) }}
                            className={`border border-solid border-black 
                                rounded-md p-px px-2 transition-all
                                ${snapshot.isDragging ? "bg-slate-300" : "bg-white"}
                            `}>
                            {`${paddler.name} (${paddler.weight})`}
                        </div>
                    )}
                </Draggable>
            )}
            {!draggable && (
                <div
                    className={`
                        flex place-content-between
                        w-48 border border-solid border-black 
                        rounded-md px-4 py-2 transition-all`}>
                    <span>
                        {`${paddler.name} (${paddler.weight})`}
                    </span>
                    <span>{paddler.races || 0}</span>
                </div>
            )

            }
        </div>
    )
}

export default Paddler;
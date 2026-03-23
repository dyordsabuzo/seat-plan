import { PaddlerType } from '../../../types/PaddlerType';
import { Draggable } from '../../DragDropWrappers';

type Props = {
    paddler: PaddlerType;
    index: number;
    draggable?: boolean;
};

export default function SeatDropPaddler({ paddler, index, draggable = true }: Props) {
    if (!draggable) {
        return (
            <div className="flex place-content-between w-48 border border-solid border-black rounded-md px-4 py-2 transition-all">
                <span>{`${paddler.name} (${paddler.weight})`}</span>
                <span>{(paddler as any).races || 0}</span>
            </div>
        );
    }

    return (
        <Draggable draggableId={String(paddler.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    style={{ ...(provided.draggableProps.style as any) }}
                    className={`border border-solid border-black rounded-md p-px px-2 transition-all ${snapshot.isDragging ? 'bg-slate-300' : 'bg-white'}`}
                >
                    {`${paddler.name} (${paddler.weight})`}
                </div>
            )}
        </Draggable>
    );
}

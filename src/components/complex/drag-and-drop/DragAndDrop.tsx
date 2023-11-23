import {DragDropContext} from "react-beautiful-dnd";

type Props = {
    onDragEnd: (result: any) => void
    children: React.ReactNode
}

export function DragAndDrop({onDragEnd, children}: Props) {
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {children}
        </DragDropContext>
    )
}
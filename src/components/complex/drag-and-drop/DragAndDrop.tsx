import DragDropContextWrapper from '../../DragDropContextWrapper';

type Props = {
    onDragEnd: (result: any) => void
    children: React.ReactNode
}

export function DragAndDrop({onDragEnd, children}: Props) {
    return (
        <DragDropContextWrapper onDragEnd={onDragEnd}>
            {children}
        </DragDropContextWrapper>
    )
}
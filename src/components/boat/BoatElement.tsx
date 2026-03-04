import { useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useBoardView } from "../../context/BoardViewContext";

// export function Draggable({id, name}: {id: string, name?: string}) {
//   const {ref} = useDraggable({id});

//   return (
//     <div key={id}>
//       <button ref={ref} className="w-[9rem] text-xs btn border border-1 p-1 px-2">{name || "draggable"}</button>
//       <DragOverlay>
//         <div>Dragging {name}...</div>
//       </DragOverlay>
//     </div>
//   );
// }

export function Droppable({id, children}: {id: string; children?: React.ReactNode}) {
  const {ref, isDropTarget} = useDroppable({id});

  return (
    <div ref={ref} className={`
      ${isDropTarget ? "droppable active" : "droppable"}
      w-[9.5rem] h-[3rem] border-2 border-dashed rounded flex items-center justify-center
    `}>
      {children}
    </div>
  );
}

export function Item({item, index, column}) {
  const {state} = useBoardView();
  const {settings} = state;   

  const {ref, isDragging} = useSortable({
    id: item.id,
    index,
    type: 'item',
    accept: 'item',
    group: column,
  });

  return (
    <div className="w-[8rem] h-[2rem] flex items-center text-xs border border-1 p-1 px-2" 
      ref={ref} data-dragging={isDragging}>
      {settings.showWeights && item.name ?  `${item.name} (${item.weight})` : item.name}
    </div>
  );
}
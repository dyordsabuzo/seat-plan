import { CollisionPriority } from '@dnd-kit/abstract';
import { useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { logger } from '../../common/helpers/logger';
import { useBoardView } from '../../context/BoardViewContext';
import { BoatPosition } from '../../enums/BoatConstant';

export function SweepSection({items}) {
  let sweep = items[0] ?? {id: `${BoatPosition.SWEEP}-0`};

  return (
    <SortableColumn 
        id={"S"}
        rows={[sweep]}>
    </SortableColumn>
  )
}

export function DrummerSection({items}) {
  let drummer = items[0] || {id: `${BoatPosition.DRUMMER}-0`};

  return (
    <SortableColumn 
        id={"D"}
        rows={[drummer]}>
    </SortableColumn>
  )
}

export function BoatSection({children, id}) {
  const {isDropTarget, ref} = useDroppable({
    id,
    type: 'column',
    accept: 'item',
    collisionPriority: CollisionPriority.Low,
  });

  const style = isDropTarget ? {background: '#00000030'} : undefined;

  return (
    <div className="min-h-[2rem] min-w-[8rem] flex flex-col gap-1 border border-1 p-1 px-2 rounded" 
        ref={ref} style={style}>
      {children}
    </div>
  );
}

export function SortableColumn(
  props: {
    id: string;
    rows?: {id: string; name?: string}[]; 
    children?: React.ReactNode;
    hideXButton?: boolean;
    removeItem?: (columnId: string, itemId: string) => void;
  }) {
  const {isDropTarget, ref} = useDroppable({
    get id() {
      return props.id;
    },
    accept: ['item'],
    collisionPriority: CollisionPriority.Low,
    type: 'column',
  });

  const handleRemoveItem = (itemId: string) => {
    logger.debug("Removing item", itemId, "from column", props.id);
    if (props.removeItem) {
      props.removeItem(props.id, itemId);
    }
  }

  return (
    <div
      ref={ref}
      className={`
        max-h-[25.25rem] 
        min-h-[2.5rem] min-w-[9rem] flex flex-col gap-1 border border-1 p-1 px-2 rounded overflow-hidden
        ${props.id === 'RESERVE' ? 'overflow-y-auto' : ''}
        ${isDropTarget ? 'bg-gray-60' : 'bg-gray-60'}
      `}
      data-shadow={'true'}
    >
      {props.id === 'RESERVE' && (
        <h2 className={`text-xs font-semibold py-2`}>Reserves</h2>
      )}
    
      {!props.children && (
          <div className='flex flex-col gap-2 bg-gray-100'>
              {props.rows.map((item, itemIndex) => (
                  <SortableItem 
                    key={`${item.id}-${itemIndex}`} 
                    item={item} 
                    column={props.id.toString()} 
                    index={itemIndex} 
                    hideXButton={props.hideXButton}
                    removeItem={handleRemoveItem}/>
              ))}
          </div>
      )}
      {props.children}
    </div>
  );
}

export function SortableItem(props: {item: any; column?: string; index: number; hideXButton?: boolean; removeItem?: (itemId: string) => void}) {
    const {isDragging, ref} = useSortable({
        get id() {
          return props.item.id;
        },
        get index() {
          return props.index;
        },
        get group() {
          return props.column;
        },
        get data() {
          return {group: props.column};
        },
        accept: 'item',
        type: 'item',
        feedback: 'clone',
    });

    const {state} = useBoardView();
    const {settings} = state;  

    return (
        <div
            ref={ref}
            className={`
                w-[7.8rem] h-[2rem] flex justify-between items-center text-xs p-1 px-2 rounded border
                ${props.item.gender === 'F' ? 'border-l-4 border-l-red-400 bg-white' : props.item.gender === 'M' ? 'border-l-4 border-l-blue-400 bg-white' : 'bg-orange-100'}
            `}
            data-shadow={isDragging ? 'true' : undefined}
            data-accent-color={props.column}
        >
            {settings.showWeights && props.item.name ?  
              `${props.item.name} (${props.item.weight})` : props.item.name}
            {props.item.name && props.hideXButton === true && (
              <button 
                className={`bg-gray-100 text-gray-600 text-xs px-1 rounded z-50`} 
                onClick={() => props.removeItem && props.removeItem(props.item.id)}>x</button>
            )}
        </div>
    );
}

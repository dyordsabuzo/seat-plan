import { CollisionPriority } from '@dnd-kit/abstract';
import { useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { logger } from '../../common/helpers/logger';
import { useBoardView } from '../../context/BoardViewContext';
import { BoatPosition } from '../../enums/BoatConstant';

export function SweepSection({items}) {
  const sweep = items[0] ?? {id: `${BoatPosition.SWEEP}-0`};
  return <SortableColumn id="S" rows={[sweep]} />
}

export function DrummerSection({items}) {
  const drummer = items[0] ?? {id: `${BoatPosition.DRUMMER}-0`};
  return <SortableColumn id="D" rows={[drummer]} />
}

export function BoatSection({children, id}) {
  const {isDropTarget, ref} = useDroppable({
    id,
    type: 'column',
    accept: 'item',
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div
      className={[
        'min-h-[2rem] min-w-[8rem] flex flex-col gap-1 border rounded p-1 px-2 transition-colors',
        isDropTarget ? 'bg-blue-50 border-blue-300' : 'border-slate-200',
      ].join(' ')}
      ref={ref}
    >
      {children}
    </div>
  );
}

// ── Shared column container ────────────────────────────────────────────────────

function ColumnShell({
  id,
  isDropTarget = false,
  isScrollable = false,
  reserveCount,
  children,
}: {
  id: string;
  isDropTarget?: boolean;
  isScrollable?: boolean;
  reserveCount?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        'flex flex-col gap-1 border rounded p-1 transition-colors',
        'max-h-[25.25rem] min-h-[2.5rem] min-w-[5.5rem]',
        isScrollable ? 'overflow-y-auto' : 'overflow-hidden',
        isDropTarget ? 'bg-blue-50 border-blue-300' : 'border-slate-200 bg-white',
      ].join(' ')}
      data-shadow="true"
      style={isScrollable ? { touchAction: 'pan-y', pointerEvents: 'auto' } : undefined}
    >
      {id.startsWith('RESERVE') && (
        <div className="px-1 pt-1 pb-0.5 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-600">Reserves</h2>
          <span className="text-[11px] font-medium text-slate-500">{reserveCount ?? 0}</span>
        </div>
      )}
      {children}
    </div>
  );
}

export function SortableColumn(props: {
  id: string;
  type?: string;
  rows?: {id: string; name?: string}[];
  reserveCount?: number;
  hideXButton?: boolean;
  removeItem?: (columnId: string, itemId: string) => void;
}) {
  const {isDropTarget, ref} = useDroppable({
    get id() { return props.id; },
    accept: ['item'],
    collisionPriority: CollisionPriority.Low,
    type: 'column',
  });

  const handleRemoveItem = (itemId: string) => {
    logger.debug('Removing item', itemId, 'from column', props.id);
    props.removeItem?.(props.id, itemId);
  };

  return (
    <div ref={ref}>
      <ColumnShell id={props.id} isDropTarget={isDropTarget} isScrollable={props.id.startsWith('RESERVE')} reserveCount={props.reserveCount}>
        <div className="flex flex-col gap-1">
          {props.rows?.map((item, itemIndex) => (
            <SortableItem
              key={[props.type, item.id, itemIndex].filter(Boolean).join('-')}
              item={item}
              column={props.id.toString()}
              index={itemIndex}
              hideXButton={props.hideXButton}
              removeItem={handleRemoveItem}
            />
          ))}
        </div>
      </ColumnShell>
    </div>
  );
}

export function ReadOnlyColumn(props: {
  id: string;
  rows?: {id: string; name?: string}[];
  reserveCount?: number;
}) {
  return (
    <ColumnShell id={props.id} isScrollable={props.id.startsWith('RESERVE')} reserveCount={props.reserveCount}>
      <div className="flex flex-col gap-1">
        {props.rows?.map((item, itemIndex) => (
          <div
            key={[props.id, item.id, itemIndex].join('-')}
            title={item.name || ''}
            className="h-[2rem] min-w-[5.5rem] flex items-center px-2 rounded border border-slate-100 bg-slate-50 text-xs truncate"
          >
            {item.name || ''}
          </div>
        ))}
      </div>
    </ColumnShell>
  );
}

export function SortableItem(props: {
  item: any;
  column?: string;
  index: number;
  hideXButton?: boolean;
  removeItem?: (itemId: string) => void;
}) {
    const itemId = String(props.item?.id)

    const {isDragging, ref} = useSortable({
        get id()    { return itemId; },
        get index() { return props.index; },
        get group() { return props.column; },
        get data()  { return { group: props.column }; },
        accept: 'item',
        type: 'item',
        feedback: 'clone',
    });

    const {state} = useBoardView();
    if (!state) return null;

    const { settings } = state;
    const isEmpty = !props.item.name || props.item.name.includes('Empty');
    const label = settings.showWeights && props.item.name
        ? `${props.item.name} (${props.item.weight ?? '–'}kg)`
        : (props.item.name ?? '');

    // Gender accent: left border colour
    const genderClass =
        props.item.gender === 'F' ? 'border-l-[3px] border-l-rose-400' :
        props.item.gender === 'M' ? 'border-l-[3px] border-l-blue-400' : '';

    return (
        <div
          ref={ref}
          title={label || undefined}
          data-shadow={isDragging ? 'true' : undefined}
          data-accent-color={props.column}
          style={{ touchAction: 'none', pointerEvents: 'auto' }}
          onMouseDown={() => { try { document.body.style.userSelect = 'none'; } catch (_) {} }}
          onMouseUp={()   => { try { document.body.style.userSelect = '';      } catch (_) {} }}
          className={[
            'h-[2rem] flex items-center justify-between gap-1 px-2 rounded border text-xs',
            'cursor-grab active:cursor-grabbing select-none transition-shadow',
            isDragging ? 'shadow-lg opacity-50 ring-2 ring-blue-300' : 'shadow-sm hover:shadow-md',
            isEmpty
                ? 'border-dashed border-slate-200 bg-slate-50 text-slate-300'
                : `border-slate-200 bg-white ${genderClass}`,
          ].join(' ')}
        >
            <span className="truncate flex-1">{label}</span>

            {!isEmpty && props.hideXButton && props.item.name && (
                <button
                    type="button"
                    aria-label={`Remove ${props.item.name}`}
                onClick={() => props.removeItem?.(itemId)}
                    className={[
                        'shrink-0 flex items-center justify-center w-4 h-4 rounded-full',
                        'text-slate-300 hover:text-red-500 hover:bg-red-50',
                        'transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-400',
                    ].join(' ')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" fill="currentColor" className="w-2 h-2" aria-hidden>
                        <path d="M1.22 1.22a.75.75 0 0 1 1.06 0L5 3.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L6.06 5l2.72 2.72a.75.75 0 1 1-1.06 1.06L5 6.06 2.28 8.78a.75.75 0 0 1-1.06-1.06L3.94 5 1.22 2.28a.75.75 0 0 1 0-1.06Z" />
                    </svg>
                </button>
            )}
        </div>
    );
}


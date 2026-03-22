import { BoatPosition } from "../../enums/BoatConstant";
import { SortableColumn } from "./BoatSection";

type Props = {
    reserveOpen: boolean;
    expanded: boolean;
    isSmall: boolean;
    reserveRows: any[];
    setReserveOpen: (open: boolean) => void;
};

export default function ReserveSlideOutPanel({
    reserveOpen,
    expanded,
    isSmall,
    reserveRows,
    setReserveOpen,
}: Props) {
    if (!reserveOpen) return null;

    return (
        <div
            id="reserve-panel"
            aria-hidden={!reserveOpen}
            className={`
                fixed bottom-0 left-0 h-[70vh] ${(expanded && isSmall) ? 'z-[1120]' : 'z-50'} 
                transform transition-all duration-300 ease-in-out md:hidden 
                ${reserveOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
            `}
            style={{ width: '10rem' }}
        >
            <div
                className={`${reserveOpen ? 'block' : 'hidden'} fixed inset-0 ${(expanded && isSmall) ? 'z-[1119]' : 'z-40'} bg-black/40`}
                onClick={() => setReserveOpen(false)}
            />
            <div className={`
                relative h-full w-[170px] bg-white p-4 shadow-lg overflow-auto 
                ${(expanded && isSmall) ? 'z-[1120]' : 'z-50'}
            `} style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Reserves</h3>
                    <button
                        aria-label="Close reserves"
                        onClick={() => setReserveOpen(false)}
                        className="px-2 py-1 text-sm rounded bg-slate-100"
                    >
                        Close
                    </button>
                </div>
                <SortableColumn
                    key={`${BoatPosition.RESERVE}-panel`}
                    type={`panel`}
                    id={"RESERVE-panel"}
                    rows={reserveRows}
                />
            </div>
        </div>
    );
}

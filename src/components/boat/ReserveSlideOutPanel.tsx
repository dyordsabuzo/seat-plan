import { SortableColumn } from "./BoatSection";

type Props = {
    reserveOpen: boolean;
    expanded: boolean;
    isSmall: boolean;
    reserveRows: any[];
    setReserveOpen: (open: boolean) => void;
};

// Z-index: sit above the fullscreen boat view (z-1050) when both are open
const PANEL_Z = 'z-[1120]'
const BACKDROP_Z = 'z-[1119]'

export default function ReserveSlideOutPanel({
    reserveOpen,
    expanded,
    isSmall,
    reserveRows,
    setReserveOpen,
}: Props) {
    // Always render so the CSS transition plays correctly on close
    const fullscreen = expanded && isSmall
    const reserveCount = reserveRows.filter((row) => {
        const label = String(row?.name ?? row?.content ?? "").trim().toLowerCase()
        return label.length > 0 && label !== 'empty seat'
    }).length

    return (
        <>
            {/* Backdrop */}
            <div
                aria-hidden
                onClick={() => setReserveOpen(false)}
                className={[
                    'fixed inset-0 md:hidden bg-black/40 transition-opacity duration-300',
                    fullscreen ? BACKDROP_Z : 'z-40',
                    reserveOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                ].join(' ')}
            />

            {/* Drawer */}
            <div
                id="reserve-panel"
                aria-hidden={!reserveOpen}
                className={[
                    'fixed bottom-0 left-0 h-[70vh] w-44 md:hidden',
                    'transform transition-transform duration-300 ease-in-out',
                    fullscreen ? PANEL_Z : 'z-50',
                    reserveOpen ? 'translate-x-0' : '-translate-x-full',
                ].join(' ')}
            >
                <div
                    className="relative h-full w-full overflow-y-auto bg-white p-4 shadow-xl rounded-tr-2xl"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-800">Reserves ({reserveCount})</h3>
                        <button
                            type="button"
                            aria-label="Close reserves"
                            onClick={() => setReserveOpen(false)}
                            className="flex items-center justify-center w-6 h-6 rounded-full
                                text-slate-400 hover:text-slate-600 hover:bg-slate-100
                                transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        >
                            {/* ✕ icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" fill="currentColor" className="w-2.5 h-2.5" aria-hidden>
                                <path d="M1.22 1.22a.75.75 0 0 1 1.06 0L5 3.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L6.06 5l2.72 2.72a.75.75 0 1 1-1.06 1.06L5 6.06 2.28 8.78a.75.75 0 0 1-1.06-1.06L3.94 5 1.22 2.28a.75.75 0 0 1 0-1.06Z" />
                            </svg>
                        </button>
                    </div>

                    <SortableColumn
                        id="RESERVE"
                        type="panel"
                        rows={reserveRows}
                        reserveCount={reserveCount}
                    />
                </div>
            </div>
        </>
    )
}


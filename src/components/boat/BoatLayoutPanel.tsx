import { RefObject } from "react";
import HorizontalLineGauge from "../complex/gauge/HorizontalLineGauge";
import VerticalLineGauge from "../complex/gauge/VerticalLineGauge";
import { ReadOnlyColumn, SortableColumn } from "./BoatSection";

type Props = {
    items: any;
    reserveOpen: boolean;
    expanded: boolean;
    isSmall: boolean;
    containerRef: RefObject<HTMLDivElement | null>;
    race: any;
    viewOnly: boolean;
    reserveRows: any[];
    drummerRows: any[];
    leftRows: any[];
    rightRows: any[];
    sweepRows: any[];
    sideBalanceValue?: number | string;
    lineBalanceValue?: number | string;
    sideWeightTolerance: number;
    lineWeightTolerance: number;
    handleRemoveItem: (columnId: string, itemId: string) => void;
};

// Whether the layout should go fullscreen (mobile + expanded)
const isFullscreen = (expanded: boolean, isSmall: boolean) => expanded && isSmall

export default function BoatLayoutPanel({
    items,
    reserveOpen,
    expanded,
    isSmall,
    containerRef,
    race,
    viewOnly,
    reserveRows,
    drummerRows,
    leftRows,
    rightRows,
    sweepRows,
    sideBalanceValue,
    lineBalanceValue,
    sideWeightTolerance,
    lineWeightTolerance,
    handleRemoveItem,
}: Props) {
    if (!items) return null

    const fullscreen = isFullscreen(expanded, isSmall)

    return (
        <div
            ref={containerRef}
            role={fullscreen ? 'dialog' : undefined}
            aria-modal={fullscreen ? true : undefined}
            aria-label={fullscreen ? 'Boat full view' : undefined}
            className={[
                'flex gap-2',
                fullscreen
                    ? 'fixed inset-0 z-[1050] bg-white overflow-auto items-stretch'
                    : 'p-2',
            ].join(' ')}
        >
            {/* Reserve column — hidden on mobile (accessible via slide-out) */}
            {!isSmall && !reserveOpen && (
                <div className="md:block" style={{ pointerEvents: 'auto' }}>
                    {viewOnly ? (
                        <ReadOnlyColumn id="RESERVE" rows={reserveRows} />
                    ) : (
                        <SortableColumn id="RESERVE" rows={reserveRows} />
                    )}
                </div>
            )}

            {/* Centre column: gauges + boat seats */}
            <div className={[
                'flex flex-col items-center gap-2',
                fullscreen ? 'relative justify-center w-full h-full' : 'mt-6 sm:mt-1',
            ].join(' ')}>

                {/* Race info badge — only shown in fullscreen mode */}
                {fullscreen && (
                    <div className="absolute left-0 top-12 z-10 rounded-r-xl border bg-white/90 px-3 py-1 text-sm text-gray-600 shadow-sm">
                        {race?.category} · {race?.type} · {race?.distance}
                    </div>
                )}

                {/* Side-balance gauge (horizontal) */}
                <div className={fullscreen ? 'absolute top-0 z-50 w-full' : 'w-full'}>
                    <HorizontalLineGauge
                        value={Number(sideBalanceValue || 0)}
                        GHeight={8}
                        toleranceMin={-sideWeightTolerance}
                        toleranceMax={sideWeightTolerance}
                    />
                </div>

                {/* Seat layout */}
                <div className={[
                    'flex flex-col items-center gap-1',
                    fullscreen ? 'scale-[120%]' : '',
                ].join(' ')}>
                    {/* Drummer */}
                    {viewOnly ? (
                        <ReadOnlyColumn id="DRUMMER" rows={drummerRows} />
                    ) : (
                        <SortableColumn
                            id="DRUMMER"
                            rows={drummerRows}
                            hideXButton
                            removeItem={handleRemoveItem}
                        />
                    )}

                    {/* Drum visual indicator */}
                    <div className="h-8 w-8 rounded-full border-2 border-orange-200" aria-hidden />

                    {/* Left + Right paddling seats */}
                    <div className="flex gap-6">
                        <div className="flex gap-1">
                            {viewOnly ? (
                                <ReadOnlyColumn id="LEFT" rows={leftRows} />
                            ) : (
                                <SortableColumn id="LEFT" rows={leftRows} hideXButton removeItem={handleRemoveItem} />
                            )}
                            {viewOnly ? (
                                <ReadOnlyColumn id="RIGHT" rows={rightRows} />
                            ) : (
                                <SortableColumn id="RIGHT" rows={rightRows} hideXButton removeItem={handleRemoveItem} />
                            )}
                        </div>
                    </div>

                    {/* Sweep */}
                    {viewOnly ? (
                        <ReadOnlyColumn id="SWEEP" rows={sweepRows} />
                    ) : (
                        <SortableColumn id="SWEEP" rows={sweepRows} hideXButton removeItem={handleRemoveItem} />
                    )}
                </div>
            </div>

            {/* Line-balance gauge (vertical) */}
            <div className={fullscreen ? 'absolute right-0 z-50 h-full flex items-center' : 'flex items-end ml-5 sm:ml-2'}>
                <VerticalLineGauge
                    value={Number(lineBalanceValue || 0)}
                    GWidth={8}
                    GHeight={fullscreen ? 800 : 400}
                    toleranceMin={-lineWeightTolerance}
                    toleranceMax={lineWeightTolerance}
                />
            </div>
        </div>
    )
}


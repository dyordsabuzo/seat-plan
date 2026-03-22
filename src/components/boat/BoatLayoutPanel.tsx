import { RefObject } from "react";
import { BoatPosition } from "../../enums/BoatConstant";
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
    if (!items) return null;

    return (
        <div
            ref={containerRef}
            role={expanded && isSmall ? 'dialog' : undefined}
            aria-modal={expanded && isSmall ? true : undefined}
            aria-label={expanded && isSmall ? 'Boat full view' : undefined}
            className={`flex gap-2 ${(expanded && isSmall) ? 'items-stretch fixed inset-0 z-[1050] bg-white overflow-auto' : 'p-2'}`}>
            {!reserveOpen && (
                <div className="hidden md:block" style={{ pointerEvents: 'auto' }}>
                    {viewOnly ? (
                        <ReadOnlyColumn key={BoatPosition.RESERVE} id={`RESERVE`} rows={reserveRows} />
                    ) : (
                        <SortableColumn key={BoatPosition.RESERVE} id={`RESERVE`} rows={reserveRows} />
                    )}
                </div>
            )}

            <div className="md:hidden" />

            <div className={`
                    flex flex-col items-center gap-2
                    ${(expanded && isSmall) ? 'relative justify-center w-full h-full ' : ' mt-6 sm:mt-1 '}
                `}>
                {expanded && isSmall && (
                    <div className={`
                        absolute -left-2 top-12 z-55 border border-1 text-base py-1 px-3
                        text-gray-500 pr-12
                        rounded-r-xl
                    `}>
                        {race?.category} - {race.type} - {race.distance}
                    </div>
                )}
                <div className={`${(expanded && isSmall) ? 'absolute top-0 z-50 w-full' : ''}`}>
                    <HorizontalLineGauge
                        value={Number(sideBalanceValue || 0)}
                        GHeight={8}
                        toleranceMin={-sideWeightTolerance}
                        toleranceMax={sideWeightTolerance}
                    />
                </div>
                <div className={`flex flex-col items-center gap-1
                        ${(expanded && isSmall) ? 'scale-[120%]' : ''}
                    `}>
                    {viewOnly ? (
                        <ReadOnlyColumn key={BoatPosition.DRUMMER} id={"DRUMMER"} rows={drummerRows} />
                    ) : (
                        <SortableColumn
                            key={BoatPosition.DRUMMER}
                            id={"DRUMMER"}
                            rows={drummerRows}
                            hideXButton={true}
                            removeItem={handleRemoveItem}
                        />
                    )}

                    <div className={`
                        text-gray-900 ring-2 ring-orange-200
                        dark:focus:ring-teal-700 
                        rounded-full p-2 w-8 h-8
                    `}/>

                    <div className={`flex gap-6`}>
                        <div className={`flex gap-1`}>
                            {viewOnly ? (
                                <ReadOnlyColumn key={BoatPosition.LEFT} id={"LEFT"} rows={leftRows} />
                            ) : (
                                <SortableColumn
                                    key={BoatPosition.LEFT}
                                    id={"LEFT"}
                                    rows={leftRows}
                                    hideXButton={true}
                                    removeItem={handleRemoveItem}
                                />
                            )}

                            {viewOnly ? (
                                <ReadOnlyColumn key={BoatPosition.RIGHT} id={"RIGHT"} rows={rightRows} />
                            ) : (
                                <SortableColumn
                                    key={BoatPosition.RIGHT}
                                    id={"RIGHT"}
                                    rows={rightRows}
                                    hideXButton={true}
                                    removeItem={handleRemoveItem}
                                />
                            )}
                        </div>
                    </div>

                    {viewOnly ? (
                        <ReadOnlyColumn key={BoatPosition.SWEEP} id={"SWEEP"} rows={sweepRows} />
                    ) : (
                        <SortableColumn
                            key={BoatPosition.SWEEP}
                            id={"SWEEP"}
                            rows={sweepRows}
                            hideXButton={true}
                            removeItem={handleRemoveItem}
                        />
                    )}
                </div>

            </div>
            <div className={`${(expanded && isSmall) ? '' : 'flex items-end ml-5 sm:ml-2'}`}>
                <div className={`${(expanded && isSmall) ? 'absolute right-0 z-50 h-full flex items-center' : ''}`}>
                    <VerticalLineGauge
                        value={Number(lineBalanceValue || 0)}
                        GWidth={8}
                        GHeight={(expanded && isSmall) ? 800 : 400}
                        toleranceMin={-lineWeightTolerance}
                        toleranceMax={lineWeightTolerance}
                    />
                </div>
            </div>
        </div>
    );
}

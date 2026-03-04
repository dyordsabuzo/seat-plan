import { useEffect, useState } from "react";
import { BoatPosition } from "../../enums/BoatConstant";
// import { Draggable, Item } from "./BoatElement";
import { defaultPreset, KeyboardSensor, PointerSensor } from '@dnd-kit/dom';
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { logger } from "../../common/helpers/logger";
import { useSetupState } from "../../context/SetupContext";
import HorizontalLineGauge from "../complex/gauge/HorizontalLineGauge";
import VerticalLineGauge from "../complex/gauge/VerticalLineGauge";
import { SortableColumn } from "./BoatSection";

export const BoatStructure = ({ boatType, boardSetup, updateConfig }: { boatType: string, boardSetup: any, updateConfig: (config: any) => void }) => {
    const [backup, setBackup] = useState(null);
    const {state, checkBoatBalance} = useSetupState();

    logger.debug("Rendering BoatStructure with boardSetup", boardSetup, "and boatType", boatType)
    if (typeof boardSetup === "string") {
        logger.debug("Parsing boardSetup string", boardSetup)
        boardSetup = JSON.parse(boardSetup);
    }

    const paddlers = boardSetup && boardSetup.reduce((acc, position) => {
        return acc.concat(position);
    }, []);

    const sensors = [
        PointerSensor.configure({
            activatorElements(source) {
            return [source.element, source.handle];
            },
        }),
        KeyboardSensor,
    ];

    const [items, setItems] = useState(null);
    const [reserveOpen, setReserveOpen] = useState(false)
    
    useEffect(() => {
        if (boardSetup) {
            setItems({
                [BoatPosition.RESERVE]: boardSetup[BoatPosition.RESERVE].map((item) => String(item.id)) || [],
                [BoatPosition.DRUMMER]: boardSetup[BoatPosition.DRUMMER].map((item) => String(item.id)) || [],
                [BoatPosition.LEFT]: boardSetup[BoatPosition.LEFT].map((item) => String(item.id)) || [],
                [BoatPosition.RIGHT]: boardSetup[BoatPosition.RIGHT].map((item) => String(item.id)) || [],
                [BoatPosition.SWEEP]: boardSetup[BoatPosition.SWEEP].map((item) => String(item.id)) || [],
            });
        }
        return () => {};
    // eslint-disable-next-line         
    }, [boardSetup]);

    useEffect(() => {
        if (items !== null && boardSetup) {
            boardSetup[BoatPosition.RESERVE] = items[BoatPosition.RESERVE].map(id => paddlers.find(p => String(p.id) === String(id)) || {id});
            boardSetup[BoatPosition.DRUMMER] = items[BoatPosition.DRUMMER].map(id => paddlers.find(p => String(p.id) === String(id)) || {id});
            boardSetup[BoatPosition.LEFT] = items[BoatPosition.LEFT].map(id => paddlers.find(p => String(p.id) === String(id)) || {id});
            boardSetup[BoatPosition.RIGHT] = items[BoatPosition.RIGHT].map(id => paddlers.find(p => String(p.id) === String(id)) || {id});
            boardSetup[BoatPosition.SWEEP] = items[BoatPosition.SWEEP].map(id => paddlers.find(p => String(p.id) === String(id)) || {id});

            updateConfig(boardSetup);
        }
        return () => {};
    // eslint-disable-next-line 
    }, [items]);

    const sanitiseItems = () => {
        // drummer
        if (items[BoatPosition.DRUMMER].length > 1) {
            const [originalDrummer] = backup[BoatPosition.DRUMMER];
            items[BoatPosition.DRUMMER] = [items[BoatPosition.DRUMMER].find(item => String(item) !== String(originalDrummer)) || `${BoatPosition.DRUMMER}-0`];
            if (!isNaN(originalDrummer)) {
                items[BoatPosition.RESERVE].push(originalDrummer);
            }
        } else if (items[BoatPosition.DRUMMER].length === 0) {
            items[BoatPosition.DRUMMER] = [`${BoatPosition.DRUMMER}-0`];
        }

        // sweep
        if (items[BoatPosition.SWEEP].length > 1) {
            const [originalSweep] = backup[BoatPosition.SWEEP];
            items[BoatPosition.SWEEP] = [items[BoatPosition.SWEEP].find(item => String(item) !== String(originalSweep)) || `${BoatPosition.SWEEP}-0`];
            if (!isNaN(originalSweep)) {
                items[BoatPosition.RESERVE].push(originalSweep);
            }
        } else if (items[BoatPosition.SWEEP].length === 0) {
            items[BoatPosition.SWEEP] = [`${BoatPosition.SWEEP}-0`];
        }

        // left side
        const leftLength = items[BoatPosition.LEFT].length;
        if (leftLength >= 10) {
            const leftSideLimit = items[BoatPosition.LEFT].slice(0, 10);
            
            items[BoatPosition.LEFT].slice(10).forEach(item => {
                if (!isNaN(item)) {
                    items[BoatPosition.RESERVE].push(item);
                }
            });
            items[BoatPosition.LEFT] = leftSideLimit;
        } else {
            const updatedLeft = items[BoatPosition.LEFT].map((item, index) => !isNaN(item) ? item : `${BoatPosition.LEFT}-${index}`);
            updatedLeft.push(...Array.from({ length: 10 - leftLength }, (_, i) => i).map(index => `${BoatPosition.LEFT}-${leftLength + index}`));
            items[BoatPosition.LEFT] = updatedLeft;
        }

        // right side
        const rightLength = items[BoatPosition.RIGHT].length;
        if (rightLength >= 10) {
            const rightSideLimit = items[BoatPosition.RIGHT].slice(0, 10);
            
            items[BoatPosition.RIGHT].slice(10).forEach(item => {
                if (!isNaN(item)) {
                    items[BoatPosition.RESERVE].push(item);
                }
            });
            items[BoatPosition.RIGHT] = rightSideLimit;
        } else {
            const updatedRight = items[BoatPosition.RIGHT].map((item, index) => !isNaN(item) ? item : `${BoatPosition.RIGHT}-${index}`);
            updatedRight.push(...Array.from({ length: 10 - rightLength }, (_, i) => i).map(index => `${BoatPosition.RIGHT}-${rightLength + index}`));
            items[BoatPosition.RIGHT] = updatedRight;
        }
    }

    const handleRemoveItem = (columnId: string, itemId: string) => {
        switch (columnId) {
            case "DRUMMER":
                items[BoatPosition.DRUMMER] = [`${BoatPosition.DRUMMER}-0`];
                break;
            case "RIGHT":
                items[BoatPosition.RIGHT] = items[BoatPosition.RIGHT].filter(id => String(id) !== String(itemId));
                break;
            case "LEFT":
                items[BoatPosition.LEFT] = items[BoatPosition.LEFT].filter(id => String(id) !== String(itemId));
                break;
            case "SWEEP":
                items[BoatPosition.SWEEP] = [`${BoatPosition.SWEEP}-0`];
                break;
        }
        
        if (!isNaN(Number(itemId))) {
            items[BoatPosition.RESERVE].push(itemId);
        }
        sanitiseItems();
        setItems({ ...items });
    };
    
    const handleDragEnd = (event) => {
        if (event.canceled) {
            // setItems(snapshot);
            setItems(backup);
        }

        sanitiseItems();
        setItems({ ...items });
    };

    const handleDragOver = (event) => {
        // operation may be undefined depending on the event shape; guard access
        const {source, target} = event?.operation;

        if (!event?.operation) {
            return;
        }

        if (source && source.type === 'column') return;

        if (String(source?.id) === String(target?.id)) {
            return;
        }

        if (typeof event.preventDefault === 'function') event.preventDefault();

        setItems((items) => move(items, event));
    };

    // let snapshot = structuredClone(items);

    return (
        <DragDropProvider
            plugins={defaultPreset.plugins}
            sensors={sensors}
            onDragStart={(event) => {
                // snapshot = structuredClone(items);
                setBackup(structuredClone(items));
            }}
            onDragOver={handleDragOver}                        
            onDragEnd={handleDragEnd}>
            {items && (
                <div className={`flex gap-2`}>
                    {/* Reserve column: inline on md+, slide-out panel on small screens */}
                    <div className="hidden md:block">
                        <SortableColumn 
                            key={BoatPosition.RESERVE} 
                            id={"RESERVE"}
                            rows={items[BoatPosition.RESERVE].map(id => paddlers?.find(p => String(p.id) === String(id)) || {id, name: "Empty Seat"} as any)}/>
                    </div>

                    {/* Small-screen placeholder (floating button provided outside main flow) */}
                    <div className="md:hidden" />

                    <div className={`flex flex-col items-center gap-2`}>
                        <HorizontalLineGauge
                            value={checkBoatBalance(boardSetup, boatType)?.sideBalance.value}
                            GHeight={8}
                            toleranceMin={-state.settings.sideWeightTolerance}
                            toleranceMax={state.settings.sideWeightTolerance}
                        />
                        <SortableColumn 
                            key={BoatPosition.DRUMMER} 
                            id={"DRUMMER"}
                            rows={items[BoatPosition.DRUMMER].map((id, index) => paddlers?.find(p => String(p.id) === String(id)) || {id: `${BoatPosition.DRUMMER}-${index}`, name: ""})}
                            hideXButton={true}
                            removeItem={handleRemoveItem}
                            />

                        <div className={`
                            text-gray-900 ring-2 ring-orange-200
                            dark:focus:ring-teal-700 
                            rounded-full p-2 w-8 h-8
                        `}/>

                        <div className={`flex gap-6`}>
                            <div className={`flex gap-2`}>
                                <SortableColumn 
                                    key={BoatPosition.LEFT} 
                                    id={"LEFT"}
                                    rows={items[BoatPosition.LEFT].map((id, index) => paddlers?.find(p => String(p.id) === String(id)) || {id: `${BoatPosition.LEFT}-${index}`, name: ""})}
                                    hideXButton={true}
                                    removeItem={handleRemoveItem}
                                    />
                                
                                <SortableColumn 
                                    key={BoatPosition.RIGHT} 
                                    id={"RIGHT"}
                                    rows={items[BoatPosition.RIGHT].map((id, index) => paddlers?.find(p => String(p.id) === String(id)) || {id: `${BoatPosition.RIGHT}-${index}`, name: ""})}
                                    hideXButton={true}
                                    removeItem={handleRemoveItem}
                                    />
                            </div>
                            
                            <VerticalLineGauge
                                value={checkBoatBalance(boardSetup, boatType)?.lineBalance.value}
                                GWidth={8}
                                GHeight={400}
                                toleranceMin={-state.settings.lineWeightTolerance}
                                toleranceMax={state.settings.lineWeightTolerance}
                            />
                        </div>

                        <SortableColumn 
                            key={BoatPosition.SWEEP} 
                            id={"SWEEP"}
                            rows={items[BoatPosition.SWEEP].map((id, index) => paddlers?.find(p => String(p.id) === String(id)) || {id: `${BoatPosition.SWEEP}-${index}`, name: ""})}
                            hideXButton={true}
                            removeItem={handleRemoveItem}
                            />

                    </div>
                </div>
            )}

            {/* Floating Reserves button for small screens (fixed, bottom-right) */}
            <button
                aria-expanded={reserveOpen}
                aria-controls="reserve-panel"
                onClick={() => setReserveOpen(true)}
                className="fixed bottom-4 left-4 z-50 md:hidden inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-600 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400"
                title="Open reserves"
            >
                <span className="sr-only">Open reserves</span>
                {/* simple icon: three stacked dots */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </button>

            {/* Slide-out reserve panel for small screens (slides in from left) */}
            <div
                id="reserve-panel"
                aria-hidden={!reserveOpen}
                className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out md:hidden ${reserveOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ width: '18rem' }}
            >
                {/* backdrop overlay */}
                <div className={`fixed inset-0 bg-black/40 ${reserveOpen ? 'block' : 'hidden'}`} onClick={() => setReserveOpen(false)} />
                <div className={`relative h-full bg-white p-4 shadow-lg overflow-auto`}> 
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium">Reserves</h3>
                        <button aria-label="Close reserves" onClick={() => setReserveOpen(false)} className="px-2 py-1 text-sm rounded bg-slate-100">Close</button>
                    </div>
                    {items && (
                        <SortableColumn 
                            key={`${BoatPosition.RESERVE}-panel`} 
                            id={"RESERVE"}
                            rows={items[BoatPosition.RESERVE].map(id => paddlers?.find(p => String(p.id) === String(id)) || {id, name: "Empty Seat"} as any)}/>
                    )}
                </div>
            </div>
            {/* <DragOverlay>
                {activeId ? (
                    (() => {
                        const item = paddlers.find(p => String(p.id) === String(activeId));
                        return (
                            <div className="w-[8rem] h-[4rem] flex items-center text-sm border border-1 p-1 px-2 bg-white shadow z-50 pointer-events-none">
                                {item ? (item.name || String(item.id)) : String(activeId)}
                            </div>
                        )
                    })()
                ) : null}
            </DragOverlay> */}
        </DragDropProvider>
    );
}
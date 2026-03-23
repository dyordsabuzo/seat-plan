import { useEffect, useMemo, useRef, useState } from "react";
import { BoatPosition } from "../../enums/BoatConstant";
// import { Draggable, Item } from "./BoatElement";
import { defaultPreset, KeyboardSensor, PointerSensor } from '@dnd-kit/dom';
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { logger } from "../../common/helpers/logger";
import { useSetupState } from "../../context/SetupContext";
import { areItemsEqual, createItemsByPosition, getRowsByIds } from "../../features/boat/utils/boatStructure";
import BoatLayoutPanel from "./BoatLayoutPanel";
import BoatStatisticsPanel from "./BoatStatisticsPanel";
import ReserveSlideOutPanel from "./ReserveSlideOutPanel";

export type Props = { 
    race: any, 
    boatType: string, 
    boardSetup: any,
    viewOnly?: boolean;
    updateConfig?: (config: any) => void 
};

export const BoatStructure = ({ race, boatType, boardSetup, viewOnly = false, updateConfig }: Props) => {
    const [backup, setBackup] = useState(null);
    const {state, checkBoatBalance} = useSetupState();
    const parsedBoardSetup = useMemo(() => {
        if (typeof boardSetup === "string") {
            logger.debug("Parsing boardSetup string", boardSetup);
            return JSON.parse(boardSetup);
        }
        return boardSetup;
    }, [boardSetup]);

    const paddlers = useMemo(
        () => parsedBoardSetup?.reduce((acc: any[], position: any[]) => acc.concat(position), []) || [],
        [parsedBoardSetup]
    );

    const paddlersById = useMemo(() => {
        const index = new Map<string, any>();
        paddlers.forEach((paddler: any) => {
            if (paddler?.id !== undefined) {
                index.set(String(paddler.id), paddler);
            }
        });
        return index;
    }, [paddlers]);

    const sensors = useMemo(() => [
        PointerSensor.configure({
            activatorElements(source) {
            return [source.element, source.handle];
            },
        }),
        KeyboardSensor,
    ], []);

    const [items, setItems] = useState(createItemsByPosition(parsedBoardSetup));

    const [reserveOpen, setReserveOpen] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [isSmall, setIsSmall] = useState<boolean>(false)

    const containerRef = useRef<HTMLDivElement | null>(null)
    const prevActiveRef = useRef<HTMLElement | null>(null)
    const scrollYRef = useRef<number>(0)

    // Track small-screen state (Tailwind `md` breakpoint = 768px)
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)')
        const update = (e?: MediaQueryListEvent) => {
            const matches = e ? e.matches : mq.matches
            const small = !matches
            setIsSmall(small)
            if (!small) setExpanded(false)
        }
        update()
        if (typeof mq.addEventListener === 'function') mq.addEventListener('change', update)
        else mq.addListener(update as any)
        return () => {
            if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', update)
            else mq.removeListener(update as any)
        }
    }, [])

    // Focus-trap and Escape-to-close when expanded on small screens
    useEffect(() => {
        if (!expanded || !isSmall) return undefined

        const container = containerRef.current
        if (!container) return undefined

        // save previous active element to restore focus on close
        prevActiveRef.current = document.activeElement as HTMLElement | null

        // lock body scroll by fixing body position and preserving current scroll
        try {
            scrollYRef.current = window.scrollY || window.pageYOffset || 0
            document.body.style.position = 'fixed'
            document.body.style.top = `-${scrollYRef.current}px`
            document.body.style.left = '0'
            document.body.style.right = '0'
            document.body.style.width = '100%'
            document.body.style.overflow = 'hidden'
        } catch (e) {
            // ignore in SSR or if styles cannot be applied
        }

        const selector = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
        const getFocusable = () => Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(el => el.offsetParent !== null || el === document.activeElement)

        const focusable = getFocusable()
        if (focusable.length) {
            focusable[0].focus()
        } else {
            // if no focusable element, focus the container itself
            container.tabIndex = -1
            container.focus()
        }

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                setExpanded(false)
                return
            }

            if (e.key === 'Tab') {
                const nodes = getFocusable()
                if (!nodes.length) return
                const first = nodes[0]
                const last = nodes[nodes.length - 1]
                const active = document.activeElement as HTMLElement | null
                if (e.shiftKey) {
                    if (active === first || active === container) {
                        e.preventDefault()
                        last.focus()
                    }
                } else {
                    if (active === last) {
                        e.preventDefault()
                        first.focus()
                    }
                }
            }
        }

        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('keydown', onKey)
            // restore previous focus
            try { prevActiveRef.current?.focus() } catch (e) { /* noop */ }

            // restore body scroll and position
            try {
                document.body.style.position = ''
                document.body.style.top = ''
                document.body.style.left = ''
                document.body.style.right = ''
                document.body.style.width = ''
                document.body.style.overflow = ''
                window.scrollTo(0, scrollYRef.current || 0)
            } catch (e) {
                // ignore
            }
        }
    }, [expanded, isSmall])
    
    useEffect(() => {
        if (!parsedBoardSetup) return;
        const nextItems = createItemsByPosition(parsedBoardSetup);
        setItems((prevItems: any) => (areItemsEqual(prevItems, nextItems) ? prevItems : nextItems));
        checkBoatBalance(parsedBoardSetup, boatType);
    }, [parsedBoardSetup, boatType, checkBoatBalance]);

    useEffect(() => {
        if (items !== null && parsedBoardSetup) {
            const currentSetupItems = createItemsByPosition(parsedBoardSetup);
            if (areItemsEqual(items, currentSetupItems)) {
                return;
            }

            parsedBoardSetup[BoatPosition.RESERVE] = items[BoatPosition.RESERVE].map((id: any) => paddlersById.get(String(id)) || {id});
            parsedBoardSetup[BoatPosition.DRUMMER] = items[BoatPosition.DRUMMER].map((id: any) => paddlersById.get(String(id)) || {id});
            parsedBoardSetup[BoatPosition.LEFT] = items[BoatPosition.LEFT].map((id: any) => paddlersById.get(String(id)) || {id});
            parsedBoardSetup[BoatPosition.RIGHT] = items[BoatPosition.RIGHT].map((id: any) => paddlersById.get(String(id)) || {id});
            parsedBoardSetup[BoatPosition.SWEEP] = items[BoatPosition.SWEEP].map((id: any) => paddlersById.get(String(id)) || {id});

            checkBoatBalance(parsedBoardSetup, boatType);

            if (updateConfig) {
                updateConfig(parsedBoardSetup);
            }
        }
    }, [items, parsedBoardSetup, paddlersById, boatType, checkBoatBalance, updateConfig]);

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

    const reserveRows = useMemo(
        () => getRowsByIds(items[BoatPosition.RESERVE], paddlersById, (id) => ({ id, name: "Empty Seat" } as any)),
        [items, paddlersById]
    );
    const drummerRows = useMemo(
        () => getRowsByIds(items[BoatPosition.DRUMMER], paddlersById, (_id, index) => ({ id: `${BoatPosition.DRUMMER}-${index}`, name: "" })),
        [items, paddlersById]
    );
    const leftRows = useMemo(
        () => getRowsByIds(items[BoatPosition.LEFT], paddlersById, (_id, index) => ({ id: `${BoatPosition.LEFT}-${index}`, name: "" })),
        [items, paddlersById]
    );
    const rightRows = useMemo(
        () => getRowsByIds(items[BoatPosition.RIGHT], paddlersById, (_id, index) => ({ id: `${BoatPosition.RIGHT}-${index}`, name: "" })),
        [items, paddlersById]
    );
    const sweepRows = useMemo(
        () => getRowsByIds(items[BoatPosition.SWEEP], paddlersById, (_id, index) => ({ id: `${BoatPosition.SWEEP}-${index}`, name: "" })),
        [items, paddlersById]
    );

    logger.debug("Rendering BoatStructure", {boardSetup: parsedBoardSetup, items, paddlers, race})
    return (
        <div className={`w-full flex flex-col items-center sm:gap-4`}>
            <DragDropProvider
                plugins={defaultPreset.plugins}
                sensors={sensors}
                onDragStart={(event) => {
                    // snapshot = structuredClone(items);
                    setBackup(structuredClone(items));
                }}
                onDragOver={handleDragOver}                        
                onDragEnd={handleDragEnd}>
                <BoatLayoutPanel
                    items={items}
                    reserveOpen={reserveOpen}
                    expanded={expanded}
                    isSmall={isSmall}
                    containerRef={containerRef}
                    race={race}
                    viewOnly={viewOnly}
                    reserveRows={reserveRows}
                    drummerRows={drummerRows}
                    leftRows={leftRows}
                    rightRows={rightRows}
                    sweepRows={sweepRows}
                    sideBalanceValue={state.sideBalance?.value}
                    lineBalanceValue={state.lineBalance?.value}
                    sideWeightTolerance={state.settings.sideWeightTolerance}
                    lineWeightTolerance={state.settings.lineWeightTolerance}
                    handleRemoveItem={handleRemoveItem}
                />

                {/* Expand/focus button: toggle fullscreen view of boat structure */}
                <button
                    aria-pressed={expanded}
                    onClick={() => { if (isSmall) setExpanded(v => !v) }}
                    className={`
                        fixed bottom-4 right-4 z-[1100] md:hidden inline-flex items-center justify-center w-12 h-12 
                        rounded-full bg-white text-slate-800 shadow-lg border
                    `}
                    title={expanded ? 'Close full view' : 'Expand boat view'}
                >
                    <span className="sr-only">{expanded ? 'Close full view' : 'Expand boat view'}</span>
                    {expanded ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L9 7.586V5a1 1 0 112 0v4a1 1 0 01-1 1H6a1 1 0 110-2h2.586L5.707 5.707a1 1 0 010-1.414zM15.707 15.707a1 1 0 01-1.414 0L11 12.414V15a1 1 0 11-2 0v-4a1 1 0 011-1h4a1 1 0 110 2h-2.586l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 110 2H5v2a1 1 0 11-2 0V4zm14 0v3a1 1 0 11-2 0V5h-2a1 1 0 110-2h3a1 1 0 011 1zM3 16v-3a1 1 0 112 0v2h2a1 1 0 110 2H4a1 1 0 01-1-1zm14 0a1 1 0 00-1 1h-3a1 1 0 110-2h2v-2a1 1 0 112 0v3z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>

                {/* When expanded, the parent container above becomes fixed and the gauges are positioned to the page edges via conditional classes */}

                {/* Floating Reserves button for small screens (fixed, bottom-right) */}
                <button
                    aria-expanded={reserveOpen}
                    aria-controls="reserve-panel"
                    onClick={() => { if (isSmall) setReserveOpen(true) }}
                    className={`
                        fixed bottom-4 left-4 ${(expanded && isSmall) ? 'z-[1115]' : 'z-50'} md:hidden inline-flex 
                        items-center justify-center w-12 h-12 rounded-full bg-sky-600 text-white shadow-lg 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400
                    `}
                    title="Open reserves"
                >
                    <span className="sr-only">Open reserves</span>
                    {/* simple icon: three stacked dots */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </button>

                <ReserveSlideOutPanel
                    reserveOpen={reserveOpen}
                    expanded={expanded}
                    isSmall={isSmall}
                    reserveRows={reserveRows}
                    setReserveOpen={setReserveOpen}
                />
            </DragDropProvider>
            <BoatStatisticsPanel
                boatProps={state.boatProps}
                sideBalance={state.sideBalance}
                lineBalance={state.lineBalance}
            />
        </div>
    );
}
import { defaultPreset, KeyboardSensor, PointerSensor } from '@dnd-kit/dom';
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { logger } from "../../common/helpers/logger";
import { useSetupState } from "../../context/SetupContext";
import { BoatPosition } from "../../enums/BoatConstant";
import { areItemsEqual, createItemsByPosition, getRowsByIds } from "../../features/boat/utils/boatStructure";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useSmallScreen } from "../../hooks/useSmallScreen";
import BoatLayoutPanel from "./BoatLayoutPanel";
import BoatStatisticsPanel from "./BoatStatisticsPanel";
import ReserveSlideOutPanel from "./ReserveSlideOutPanel";

export type Props = {
    race: any;
    boatType: string;
    boardSetup: any;
    viewOnly?: boolean;
    updateConfig?: (config: any) => void;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Produces a new items snapshot that respects per-position capacity rules.
 * Immutable: always returns a new object; never mutates the input.
 */
function sanitise(draft: any, backup: any): any {
    const next = { ...draft }

    // Drummer — exactly one seat
    if (next[BoatPosition.DRUMMER].length > 1) {
        const [originalDrummer] = backup[BoatPosition.DRUMMER]
        const replacement = next[BoatPosition.DRUMMER].find(
            (item: any) => String(item) !== String(originalDrummer),
        ) ?? `${BoatPosition.DRUMMER}-0`
        next[BoatPosition.DRUMMER] = [replacement]
        if (!isNaN(originalDrummer)) next[BoatPosition.RESERVE] = [...next[BoatPosition.RESERVE], originalDrummer]
    } else if (next[BoatPosition.DRUMMER].length === 0) {
        next[BoatPosition.DRUMMER] = [`${BoatPosition.DRUMMER}-0`]
    }

    // Sweep — exactly one seat
    if (next[BoatPosition.SWEEP].length > 1) {
        const [originalSweep] = backup[BoatPosition.SWEEP]
        const replacement = next[BoatPosition.SWEEP].find(
            (item: any) => String(item) !== String(originalSweep),
        ) ?? `${BoatPosition.SWEEP}-0`
        next[BoatPosition.SWEEP] = [replacement]
        if (!isNaN(originalSweep)) next[BoatPosition.RESERVE] = [...next[BoatPosition.RESERVE], originalSweep]
    } else if (next[BoatPosition.SWEEP].length === 0) {
        next[BoatPosition.SWEEP] = [`${BoatPosition.SWEEP}-0`]
    }

    // Left / Right — max 10 seats each
    for (const pos of [BoatPosition.LEFT, BoatPosition.RIGHT] as const) {
        const current = next[pos]
        const len = current.length
        if (len >= 10) {
            const overflow = current.slice(10).filter((id: any) => !isNaN(id))
            next[BoatPosition.RESERVE] = [...next[BoatPosition.RESERVE], ...overflow]
            next[pos] = current.slice(0, 10)
        } else {
            const filled = current.map((item: any, i: number) => (!isNaN(item) ? item : `${pos}-${i}`))
            const padding = Array.from({ length: 10 - len }, (_, i) => `${pos}-${len + i}`)
            next[pos] = [...filled, ...padding]
        }
    }

    return next
}

// ─── component ────────────────────────────────────────────────────────────────

export const BoatStructure = ({ race, boatType, boardSetup, viewOnly = false, updateConfig }: Props) => {
    const { state, checkBoatBalance } = useSetupState()

    // ── parsed setup ───────────────────────────────────────────────────────────
    const parsedBoardSetup = useMemo(() => {
        if (typeof boardSetup === "string") {
            logger.debug("Parsing boardSetup string", boardSetup)
            return JSON.parse(boardSetup)
        }
        return boardSetup
    }, [boardSetup])

    const paddlers = useMemo(
        () => parsedBoardSetup?.reduce((acc: any[], position: any[]) => acc.concat(position), []) ?? [],
        [parsedBoardSetup],
    )

    const paddlersById = useMemo(() => {
        const index = new Map<string, any>()
        paddlers.forEach((p: any) => { if (p?.id !== undefined) index.set(String(p.id), p) })
        return index
    }, [paddlers])

    // ── dnd-kit sensors ────────────────────────────────────────────────────────
    const sensors = useMemo(() => [
        PointerSensor.configure({
            activatorElements(source) { return [source.element, source.handle] },
        }),
        KeyboardSensor,
    ], [])

    // ── items state ────────────────────────────────────────────────────────────
    const [items, setItems] = useState(() => createItemsByPosition(parsedBoardSetup))
    const [backup, setBackup] = useState<any>(null)

    // Sync items when the incoming boardSetup changes (e.g. switching config tabs)
    useEffect(() => {
        if (!parsedBoardSetup) return
        const next = createItemsByPosition(parsedBoardSetup)
        setItems((prev: any) => (areItemsEqual(prev, next) ? prev : next))
        checkBoatBalance(parsedBoardSetup, boatType)
    // checkBoatBalance is stable per useCallback in SetupContext — safe dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parsedBoardSetup, boatType])

    // Propagate item changes back to the config
    useEffect(() => {
        if (!items || !parsedBoardSetup) return
        const current = createItemsByPosition(parsedBoardSetup)
        if (areItemsEqual(items, current)) return

        // Write resolved paddler objects back onto the board setup
        const positions = [
            BoatPosition.RESERVE, BoatPosition.DRUMMER,
            BoatPosition.LEFT, BoatPosition.RIGHT, BoatPosition.SWEEP,
        ] as const
        positions.forEach((pos) => {
            parsedBoardSetup[pos] = items[pos].map((id: any) => paddlersById.get(String(id)) ?? { id })
        })

        checkBoatBalance(parsedBoardSetup, boatType)
        updateConfig?.(parsedBoardSetup)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items])

    // ── mobile expand / reserve ────────────────────────────────────────────────
    const isSmall = useSmallScreen()
    const [expanded, setExpanded] = useState(false)
    const [reserveOpen, setReserveOpen] = useState(false)
    const [isLocked, setIsLocked] = useState(viewOnly)
    const containerRef = useRef<HTMLDivElement | null>(null)

    const isInteractionLocked = viewOnly || isLocked

    useEffect(() => {
        if (viewOnly) {
            setIsLocked(true)
        }
    }, [viewOnly])

    // Close expanded view when rotating to desktop
    useEffect(() => { if (!isSmall) setExpanded(false) }, [isSmall])

    const closeExpanded = useCallback(() => setExpanded(false), [])
    useScrollLock(expanded && isSmall, containerRef, closeExpanded)

    // ── drag handlers ──────────────────────────────────────────────────────────
    const handleDragStart = useCallback(() => {
        if (isInteractionLocked) return
        setBackup(structuredClone(items))
    }, [isInteractionLocked, items])

    const handleDragOver = useCallback((event: any) => {
        if (isInteractionLocked) return
        if (!event?.operation) return
        const { source, target } = event.operation
        if (source?.type === 'column') return
        if (String(source?.id) === String(target?.id)) return
        event.preventDefault?.()
        setItems((prev: any) => move(prev, event))
    }, [isInteractionLocked])

    const handleDragEnd = useCallback((event: any) => {
        if (isInteractionLocked) return
        setItems((prev: any) => {
            const base = event.canceled ? (backup ?? prev) : prev
            return sanitise(base, backup ?? base)
        })
    }, [backup, isInteractionLocked])

    const handleRemoveItem = useCallback((columnId: string, itemId: string) => {
        setItems((prev: any) => {
            if (isInteractionLocked) {
                return prev
            }
            const draft = { ...prev }
            switch (columnId) {
                case "DRUMMER": draft[BoatPosition.DRUMMER] = [`${BoatPosition.DRUMMER}-0`]; break
                case "RIGHT": draft[BoatPosition.RIGHT] = draft[BoatPosition.RIGHT].filter((id: any) => String(id) !== String(itemId)); break
                case "LEFT": draft[BoatPosition.LEFT] = draft[BoatPosition.LEFT].filter((id: any) => String(id) !== String(itemId)); break
                case "SWEEP": draft[BoatPosition.SWEEP] = [`${BoatPosition.SWEEP}-0`]; break
            }
            if (!isNaN(Number(itemId))) draft[BoatPosition.RESERVE] = [...draft[BoatPosition.RESERVE], itemId]
            return sanitise(draft, backup ?? draft)
        })
    }, [backup, isInteractionLocked])

    // ── derived rows ───────────────────────────────────────────────────────────
    const reserveRows = useMemo(
        () => getRowsByIds(items[BoatPosition.RESERVE], paddlersById, (id) => ({ id, name: "Empty Seat" } as any)),
        [items, paddlersById],
    )
    const lockedReserveLabels = useMemo(
        () => reserveRows
            .map((row: any) => String(row?.name ?? row?.content ?? "").trim())
            .filter((label) => label.length > 0 && label.toLowerCase() !== "empty seat"),
        [reserveRows],
    )
    const drummerRows = useMemo(
        () => getRowsByIds(items[BoatPosition.DRUMMER], paddlersById, (_id, i) => ({ id: `${BoatPosition.DRUMMER}-${i}`, name: "" })),
        [items, paddlersById],
    )
    const leftRows = useMemo(
        () => getRowsByIds(items[BoatPosition.LEFT], paddlersById, (_id, i) => ({ id: `${BoatPosition.LEFT}-${i}`, name: "" })),
        [items, paddlersById],
    )
    const rightRows = useMemo(
        () => getRowsByIds(items[BoatPosition.RIGHT], paddlersById, (_id, i) => ({ id: `${BoatPosition.RIGHT}-${i}`, name: "" })),
        [items, paddlersById],
    )
    const sweepRows = useMemo(
        () => getRowsByIds(items[BoatPosition.SWEEP], paddlersById, (_id, i) => ({ id: `${BoatPosition.SWEEP}-${i}`, name: "" })),
        [items, paddlersById],
    )

    logger.debug("Rendering BoatStructure", { boardSetup: parsedBoardSetup, items, paddlers, race })

    // ── render ─────────────────────────────────────────────────────────────────
    return (
        <div className="w-full flex flex-col items-center sm:gap-4">
            {!viewOnly && (
                <div className="mb-2 flex w-full justify-end">
                    <button
                        type="button"
                        onClick={() => setIsLocked((locked) => !locked)}
                        aria-pressed={isInteractionLocked}
                        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors ${
                            isInteractionLocked
                                ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                    >
                        {isInteractionLocked ? "Unlock setup" : "Lock setup"}
                    </button>
                </div>
            )}

            <DragDropProvider
                plugins={defaultPreset.plugins}
                sensors={isInteractionLocked ? [] : sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <BoatLayoutPanel
                    items={items}
                    reserveOpen={reserveOpen}
                    expanded={expanded}
                    isSmall={isSmall}
                    containerRef={containerRef}
                    race={race}
                    viewOnly={isInteractionLocked}
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

                {/* ── Mobile FABs (small screens only) ───────────────────── */}
                {isSmall && (
                    <>
                        {/* Expand / collapse full-view */}
                        <button
                            type="button"
                            aria-pressed={expanded}
                            aria-label={expanded ? 'Close full boat view' : 'Expand boat view'}
                            onClick={() => setExpanded(v => !v)}
                            className="fixed bottom-4 right-4 z-[1100] inline-flex items-center gap-1.5
                                px-3 h-10 rounded-full bg-white text-slate-700 text-xs font-medium
                                shadow-lg border border-slate-200
                                hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400
                                transition-colors"
                        >
                            {expanded ? (
                                <>
                                    {/* compress icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L9 7.586V5a1 1 0 112 0v4a1 1 0 01-1 1H6a1 1 0 110-2h2.586L5.707 5.707a1 1 0 010-1.414zM15.707 15.707a1 1 0 01-1.414 0L11 12.414V15a1 1 0 11-2 0v-4a1 1 0 011-1h4a1 1 0 110 2h-2.586l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    Close
                                </>
                            ) : (
                                <>
                                    {/* expand icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 110 2H5v2a1 1 0 11-2 0V4zm14 0v3a1 1 0 11-2 0V5h-2a1 1 0 110-2h3a1 1 0 011 1zM3 16v-3a1 1 0 112 0v2h2a1 1 0 110 2H4a1 1 0 01-1-1zm14 0a1 1 0 00-1 1h-3a1 1 0 110-2h2v-2a1 1 0 112 0v3z" clipRule="evenodd" />
                                    </svg>
                                    Expand
                                </>
                            )}
                        </button>

                        {/* Reserves drawer */}
                        <button
                            type="button"
                            aria-expanded={reserveOpen}
                            aria-controls="reserve-panel"
                            aria-label="Open reserves"
                            onClick={() => setReserveOpen(true)}
                            className={`fixed bottom-4 left-4 ${expanded ? 'z-[1115]' : 'z-50'}
                                inline-flex items-center gap-1.5 px-3 h-10 rounded-full
                                bg-sky-600 text-white text-xs font-medium shadow-lg
                                hover:bg-sky-700 focus:outline-none focus-visible:ring-2
                                focus-visible:ring-offset-2 focus-visible:ring-sky-400
                                transition-colors`}
                        >
                            {/* list icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Reserves
                        </button>
                    </>
                )}

                {isSmall && (
                    <ReserveSlideOutPanel
                        reserveOpen={reserveOpen}
                        expanded={expanded}
                        isSmall={isSmall}
                        reserveRows={reserveRows}
                        setReserveOpen={setReserveOpen}
                    />
                )}
            </DragDropProvider>

            {isSmall && isInteractionLocked && (
                <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">Reserves</h3>
                        <span className="text-xs text-slate-500">{lockedReserveLabels.length}</span>
                    </div>

                    {lockedReserveLabels.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {lockedReserveLabels.map((label, index) => (
                                <span
                                    key={`${label}-${index}`}
                                    className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700"
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500">No reserve paddlers assigned.</p>
                    )}
                </div>
            )}

            <BoatStatisticsPanel
                boatProps={state.boatProps}
                sideBalance={state.sideBalance}
                lineBalance={state.lineBalance}
            />
        </div>
    )
}
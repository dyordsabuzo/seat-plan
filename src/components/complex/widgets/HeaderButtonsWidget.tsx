import React from 'react';
import { useBoardView } from '../../../context/BoardViewContext';
import { getTabActionClassName, getTabButtonClassName, getTabListClassName } from '../../ui/Tabs';
import ConfirmModal from '../modals/ConfirmModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
    names: string[]
    clickedIndex: number | null
    onClick: (index: number) => void
    exportPdf: () => void
    addHeaderHandler: () => void
    onDeleteConfig?: (index: number) => void
    onReorderConfigs?: (fromIndex: number, toIndex: number) => void
}

type ConfigTabProps = {
    name: string
    index: number
    isActive: boolean
    isDragOver: boolean
    draggable: boolean
    onSelect: () => void
    onDelete: () => void
    onDragStart: () => void
    onDragOver: (e: React.DragEvent) => void
    onDragLeave: () => void
    onDrop: () => void
    onDragEnd: () => void
}

// ─── ConfigTab sub-component ──────────────────────────────────────────────────

function ConfigTab({
    name, index, isActive, isDragOver, draggable,
    onSelect, onDelete, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd,
}: ConfigTabProps) {
    return (
        <div
            draggable={draggable}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            className={[
                'relative flex items-center gap-1 select-none',
                isDragOver ? 'scale-[0.98] opacity-80' : '',
                draggable ? 'cursor-grab active:cursor-grabbing' : '',
            ].filter(Boolean).join(' ')}
        >
            <button
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-config-${index}`}
                id={`tab-config-${index}`}
                onClick={onSelect}
                className={getTabButtonClassName({
                    active: isActive,
                    className: [
                        isActive ? 'pr-7 text-xs' : 'pr-2 text-xs',
                        isDragOver ? 'ring-2 ring-sky-300 ring-inset' : '',
                    ].filter(Boolean).join(' '),
                })}
            >
                {name}
            </button>

            {isActive && (
                <button
                    type="button"
                    title={`Delete ${name}`}
                    aria-label={`Delete ${name}`}
                    onClick={(e) => { e.stopPropagation(); onDelete() }}
                    className={[
                        'absolute right-1 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full',
                        'text-slate-400 hover:bg-red-50 hover:text-red-500',
                        'transition-colors duration-100',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400',
                    ].join(' ')}
                >
                    {/* ✕ close icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" fill="currentColor" className="w-2 h-2" aria-hidden="true">
                        <path d="M1.22 1.22a.75.75 0 0 1 1.06 0L5 3.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L6.06 5l2.72 2.72a.75.75 0 1 1-1.06 1.06L5 6.06 2.28 8.78a.75.75 0 0 1-1.06-1.06L3.94 5 1.22 2.28a.75.75 0 0 1 0-1.06Z" />
                    </svg>
                </button>
            )}
        </div>
    )
}

// ─── HeaderButtonsWidget ──────────────────────────────────────────────────────

export function HeaderButtonsWidget({
    names,
    clickedIndex = null,
    onClick,
    exportPdf,
    addHeaderHandler,
    onDeleteConfig,
    onReorderConfigs,
}: Props) {
    const [confirmOpen, setConfirmOpen] = React.useState(false)
    const [pendingIndex, setPendingIndex] = React.useState<number | null>(null)
    const [pendingName, setPendingName] = React.useState<string | null>(null)
    const dragFromRef = React.useRef<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

    const { state, setState } = useBoardView()
    const atMaxConfigs = names.length >= state.settings.maxConfig

    // ── delete flow ────────────────────────────────────────────────────────────

    const requestDelete = (index: number) => {
        setPendingIndex(index)
        setPendingName(names[index])
        setConfirmOpen(true)
    }

    const handleConfirm = () => {
        if (pendingIndex === null) return
        try {
            onDeleteConfig?.(pendingIndex)
        } finally {
            setConfirmOpen(false)
            setPendingIndex(null)
            setPendingName(null)
        }
    }

    const handleCancel = () => {
        setConfirmOpen(false)
        setPendingIndex(null)
        setPendingName(null)
    }

    // ── drag handlers ──────────────────────────────────────────────────────────

    const handleDrop = (toIndex: number) => {
        if (dragFromRef.current !== null && dragFromRef.current !== toIndex) {
            onReorderConfigs?.(dragFromRef.current, toIndex)
        }
        dragFromRef.current = null
        setDragOverIndex(null)
    }

    // ── render ─────────────────────────────────────────────────────────────────

    return (
        <>
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 pt-4 pb-2 sm:pb-6">

                {/* Tab strip */}
                <div role="tablist" aria-label="Configurations" className={getTabListClassName('flex-wrap')}>
                    {names.map((name, index) => (
                        <ConfigTab
                            key={index}
                            name={name}
                            index={index}
                            isActive={index === clickedIndex}
                            isDragOver={dragOverIndex === index}
                            draggable={!!onReorderConfigs}
                            onSelect={() => onClick(index)}
                            onDelete={() => requestDelete(index)}
                            onDragStart={() => { dragFromRef.current = index }}
                            onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index) }}
                            onDragLeave={() => setDragOverIndex(null)}
                            onDrop={() => handleDrop(index)}
                            onDragEnd={() => { dragFromRef.current = null; setDragOverIndex(null) }}
                        />
                    ))}

                    {/* Add Config — lives at the end of the tab strip */}
                    <button
                        type="button"
                        title={atMaxConfigs ? `Maximum of ${state.settings.maxConfig} configs reached` : 'Add a new configuration'}
                        disabled={atMaxConfigs}
                        onClick={addHeaderHandler}
                        className={[
                            getTabActionClassName('text-xs'),
                            atMaxConfigs
                                ? 'cursor-not-allowed border-slate-200 text-slate-300 hover:border-slate-200 hover:bg-transparent hover:text-slate-300'
                                : '',
                        ].join(' ')}
                    >
                        {/* + icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" fill="currentColor" className="w-2.5 h-2.5" aria-hidden="true">
                            <path d="M5 1a.75.75 0 0 1 .75.75V4.25h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5H1.75a.75.75 0 0 1 0-1.5h2.5V1.75A.75.75 0 0 1 5 1Z" />
                        </svg>
                        Add config
                    </button>
                </div>

                {/* Right-side controls */}
                <div className="flex items-center gap-4 pb-1">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-gray-600">
                        <input
                            type="checkbox"
                            checked={state.settings.showWeights}
                            onChange={() =>
                                setState({
                                    ...state,
                                    settings: { ...state.settings, showWeights: !state.settings.showWeights },
                                })
                            }
                            className="h-3.5 w-3.5 rounded border-gray-300 accent-blue-600
                                focus:ring-2 focus:ring-blue-400"
                        />
                        Show weights
                    </label>
                </div>
            </div>

            <ConfirmModal
                open={confirmOpen}
                title="Delete config"
                message={pendingName ? `Delete "${pendingName}"?` : 'Delete selected config?'}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </>
    )
}
import React from 'react';
import { HeaderButton } from "../../basic/buttons/HeaderButton";
import ConfirmModal from '../modals/ConfirmModal';

type Props = {
    names: string[]
    clickedIndex: number
    onClick: (index: number) => void
    addHeaderHandler: () => void
    onDeleteConfig?: (index: number) => void
}

export function HeaderButtonsWidget({names, clickedIndex = 0, onClick, addHeaderHandler, onDeleteConfig}: Props) {
    const [confirmOpen, setConfirmOpen] = React.useState(false)
    const [pendingIndex, setPendingIndex] = React.useState<number | null>(null)
    const [pendingName, setPendingName] = React.useState<string | null>(null)

    const requestDelete = (index: number) => {
        setPendingIndex(index)
        setPendingName(names[index])
        setConfirmOpen(true)
    }

    const handleConfirm = () => {
        if (pendingIndex === null) return
        try {
            if (typeof onDeleteConfig === 'function') onDeleteConfig(pendingIndex)
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

    return (
        <>
            <div className={`flex py-4 pb-8 gap-8 items-center`}>
                <div className="flex gap-2 border-b">
                    {names.map((name, index) => (
                        <HeaderButton
                            key={index}
                            label={name}
                            isClicked={(index === clickedIndex)}
                            onClick={() => onClick(index)}
                            onContextMenu={(e: React.MouseEvent) => {
                                e.preventDefault()
                                requestDelete(index)
                            }}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button className={`
                                    rounded-md text-xs
                                    px-2 py-1 text-center
                                    text-blue-600
                                    border border-blue-200
                                    ${names.length >= 3 ? "cursor-not-allowed" : ""}
                                `}
                        onClick={() => addHeaderHandler()}
                        type={"button"}
                        disabled={names.length >= 3}
                    >
                        +Add Config
                    </button>

                    <button
                        className={`
                            rounded-md text-xs 
                            px-2 py-1 text-center text-red-600 
                            border border-red-200
                            ${names.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={() => {
                            if (clickedIndex !== null && clickedIndex >= 0 && clickedIndex < names.length) {
                                requestDelete(clickedIndex)
                            }
                        }}
                        type="button"
                    >
                        Delete Config
                    </button>
                </div>
            </div>

            <ConfirmModal
                open={confirmOpen}
                title="Delete config"
                message={pendingName ? `Delete config "${pendingName}"?` : 'Delete selected config?'}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </>
    )
}
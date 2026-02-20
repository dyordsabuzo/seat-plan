import React from 'react'

type Props = {
    className?: string
    type?: "button" | "submit" | "reset"
    isClicked?: boolean
    label: string
    onClick: () => void
    onContextMenu?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function HeaderButton({className, label, type = "button", isClicked = false, onClick, onContextMenu}: Props) {
    return (
        <button className={`
            font-semibold rounded-t-lg text-xs
            px-2 py-2 text-center
            ${isClicked ? "bg-black/80 text-white" : "bg-gray-200 text-black"}
            ${className ?? ""}
        `}
        onClick={onClick}
        onContextMenu={onContextMenu}
        type={type}>
            {label}
        </button>
    )
}
type Props = {
    className?: string
    type?: "button" | "submit" | "reset"
    isClicked?: boolean
    label: string
    onClick: () => void
}

export function HeaderButton({className, label, type = "button", isClicked = false, onClick}: Props) {
    return (
        <button className={`
            font-semibold rounded-lg text-xs
            px-2 py-2 text-center
            ${isClicked ? "bg-black/80 text-white" : "bg-black/5 text-black"}
            ${className}
        `}
                onClick={onClick}
                type={type}>
            {label}
        </button>
    )
}
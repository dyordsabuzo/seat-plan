type Props = {
    className?: string
    type?: "button" | "submit" | "reset"
    isClicked?: boolean
    label: string
    onClick: () => void
}

export function BasicButton({className, label, type = "button", isClicked = false, onClick}: Props) {
    return (
        <button className={`
            bg-white text-gray-900 ring-4 ring-lime-200
            dark:focus:ring-teal-700 font-medium rounded-lg text-sm
            px-5 py-2.5 text-center mr-2 mb-2
            ${isClicked ? "bg-gradient-to-r from-teal-200 to-lime-200" : "bg-white"}
            ${className}
        `}
                onClick={onClick}
                type={type}>
            {label}
        </button>
    )
}
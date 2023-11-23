type Props = {
    label: string
    selected: boolean
    onClick: () => void
}

export function SelectionButton({label, selected, onClick}: Props) {
    return (
        <button type="button"
                className={`
                    ${selected ? "bg-gradient-to-r from-teal-200 to-lime-200" : "bg-white"}
                    text-gray-900 ring-4 ring-lime-200 
                    dark:focus:ring-teal-700 font-medium rounded-lg text-sm 
                    px-5 py-2.5 text-center mr-2 mb-2
                `}
                onClick={onClick}>{label}</button>
    )
}
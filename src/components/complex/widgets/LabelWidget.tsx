
type Props = {
    label: string
    onClick?: () => void
}

export function LabelWidget({label, onClick = null}: Props) {
    return (
        <div className={`relative`}>
            <div className={` flex `}>
                {label}
                {onClick && (
                    <button
                        type="button"
                        className={`absolute -right-1 -top-1`}
                        onClick={onClick}>
                        <span className={`text-xs text-gray-400`}>X</span>
                    </button>
                )}
            </div>
        </div>
    )
}
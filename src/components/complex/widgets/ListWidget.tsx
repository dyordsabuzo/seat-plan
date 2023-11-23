import {useState} from "react";
import {Chevron} from "../../basic/svg/Chevron";

type Props = {
    label: string
    selectedIndex?: number
    selectedColor?: string
    widgetClassName?: string
    items: string[]
    setSelection?: (selection: string) => void
}

export function ListWidget({
                               label,
                               selectedIndex = 1,
                               selectedColor = "bg-teal-100",
                               widgetClassName,
                               items,
                               setSelection,
                               ...props
                           }: Props) {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <div className={`
            w-[17rem] rounded-lg ring-1 overflow-hidden
            ${widgetClassName}
        `}>
            <div className={`relative p-3`}>
                <h1 className={`text-lg font-medium`}>{label}</h1>
                <p className={`text-xs font-base`}>
                    {selectedIndex} of {items.length}
                </p>
                <div className={`
                    absolute right-3 top-3 rounded-full hover:bg-gray-100 p-2
                    transition-all cursor-pointer
                `} onClick={() => setIsExpanded(!isExpanded)}>
                    <Chevron expand={isExpanded}/>
                </div>
            </div>
            <div className={`
                h-40 overflow-auto 
                ${isExpanded ? "hidden" : ""}
            `}>
                {items.map((str, index) => (
                    <div key={index}
                         className={`
                            flex items-center h-10 px-3 py-2 cursor-pointer
                            ${selectedIndex === index + 1 ? selectedColor : "hover:bg-gray-100"}
                        `}
                         onClick={() => {
                             setSelection(str)
                         }}>
                        <span className={`text-xs text-gray-400`}>{index + 1}</span>
                        <span className={`text-sm pl-3 truncate`}>{str}</span>
                    </div>)
                )}
            </div>
        </div>
    )
}
import {useState} from "react";
import {Chevron} from "../../basic/svg/Chevron";
import { logger } from "../../../common/helpers/logger";

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
                               selectedIndex = -1,
                               selectedColor = "bg-teal-100",
                               widgetClassName,
                               items,
                               setSelection,
                               ...props
                           }: Props) {
    const [isExpanded, setIsExpanded] = useState(true)

    // logger.debug("Rendering ListWidget with items", items, "selectedIndex", selectedIndex)

    return (
        <div className={`
            w-[20rem] rounded-lg ring-1 overflow-hidden
            ${widgetClassName}
        `}>
            <div className={`relative p-3`}>
                <h1 className={`text-lg font-medium`}>{label}</h1>
                <p className={`text-xs font-base`}>
                    Selected {selectedIndex} of {items.length}
                </p>
                <div className={`
                    absolute right-3 top-3 rounded-full hover:bg-gray-100 p-2
                    transition-all cursor-pointer
                `} onClick={() => setIsExpanded(!isExpanded)}>
                    <Chevron expand={isExpanded}/>
                </div>
            </div>
            <div className={`
                h-40 overflow-auto modern-scroll
                ${isExpanded ? "hidden" : ""}
            `}>
                {items.map((str, index) => (
                    <div key={index}
                         className={`
                            group relative flex items-center h-10 px-3 py-2 cursor-pointer
                            ${selectedIndex + 1 === index ? selectedColor : "hover:bg-gray-100"}
                        `}
                         onClick={() => {
                            logger.debug("Selected item", str, "at index", index + 1)
                             setSelection(str)
                         }}
                         title={str}
                    >
                        <span className={`text-xs text-gray-400`}>{index + 1}</span>
                        <span className={`text-sm pl-3 truncate`}>{str}</span>
                        <span className={`absolute left-1/2 transform -translate-x-1/2 -top-8 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity`}> {str} </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
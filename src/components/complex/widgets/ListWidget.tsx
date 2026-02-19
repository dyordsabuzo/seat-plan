import { useState } from "react";
import { logger } from "../../../common/helpers/logger";
import { Chevron } from "../../basic/svg/Chevron";

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
                               selectedIndex,
                               selectedColor = "bg-teal-100",
                               widgetClassName,
                               items,
                               setSelection,
                               ...props
                           }: Props) {

    const [isExpanded, setIsExpanded] = useState(selectedIndex < 0)
    // const [index, setIndex] = useState<number | null>(selectedIndex)

    // useEffect(() => {
    //     if (index !== null && setSelection) {
    //         setIsExpanded(false)
    //         setSelection(items[index])
    //     }
    // }, [index, items, setSelection])

    logger.debug("Rendering ListWidget with items", selectedIndex, isExpanded);

    return (
        <div className={`
            w-[22rem] rounded-lg ring-1 overflow-hidden
            ${widgetClassName}
        `}>
            <div className={`relative p-3`}>
                <h1 className={`text-sm text-gray-500 font-medium`}>{label}</h1>
                <p className={`text-sm`}>
                    Selected: {selectedIndex >= 0 ? items[selectedIndex] : "None"}
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
                {items.map((str, idx) => (
                    <div key={idx}
                         className={`
                            group relative flex items-center h-10 px-3 py-2 cursor-pointer
                            ${selectedIndex=== idx ? selectedColor : "hover:bg-gray-100"}
                        `}
                         onClick={() => {
                            logger.debug("Selected item", str, "at index", idx + 1)
                            setSelection(str)
                            // setIndex(idx)
                         }}
                         title={str}
                    >
                        <span className={`text-xs text-gray-400`}>{idx + 1}</span>
                        <span className={`text-sm pl-3 truncate`}>{str}</span>
                        <span className={`absolute left-1/2 transform -translate-x-1/2 -top-8 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity`}> {str} </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
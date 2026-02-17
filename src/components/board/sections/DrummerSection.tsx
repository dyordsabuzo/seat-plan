import { logger } from "../../../common/helpers/logger";
import {BoatLabel, BoatPosition} from "../../../enums/BoatConstant";
import DroppableSection from "../../complex/drag-and-drop/DroppableSection";

type Props = {
    section: any
    onButtonClick?:  (item: any, positionId: number, index: number) => void
}

export function DrummerSection({section, onButtonClick = null}: Props) {
    logger.debug("Rendering DrummerSection with section", section)
    return (
        <div className={`flex flex-col items-center gap-2`}>
            <DroppableSection section={section}
                              id={BoatPosition.DRUMMER}
                              defaultItemLabel={BoatLabel.EMPTY_SEAT}
                              onItemButtonClick={onButtonClick}
            />
            <div className={`
               text-gray-900 ring-2 ring-slate-200 
               dark:focus:ring-teal-700 
               rounded-full p-2 w-10 h-10
           `}></div>
        </div>
    )
}
import {BoatLabel, BoatPosition} from "../../../enums/BoatConstant";
import React from "react";
import DroppableSection from "../../complex/drag-and-drop/DroppableSection";

type Props = {
    section: any
    onButtonClick?: (item: any, positionId: number, index: number) => void
}

export function LeftPaddleSection({section, onButtonClick = null}: Props) {
    return (
        <div className={`flex flex-col items-center`}>
            <DroppableSection section={section}
                              id={BoatPosition.LEFT}
                              defaultItemLabel={BoatLabel.EMPTY_SEAT}
                              onItemButtonClick={onButtonClick}
            />
        </div>
    )
}
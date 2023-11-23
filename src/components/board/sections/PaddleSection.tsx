// import {BoatPosition} from "../../../enums/BoatConstant";
import React from "react";
// import DroppableSection from "../../complex/drag-and-drop/DroppableSection";
import {LeftPaddleSection} from "./LeftPaddleSection";
import {RightPaddleSection} from "./RightPaddleSection";

type Props = {
    leftSection: any
    rightSection: any
    onButtonClick?: (item: any, positionId: number, index: number) => void
}

export function PaddleSection({leftSection, rightSection, onButtonClick = null}: Props) {
    return (
        <div className={`flex justify-center gap-3`}>
            <LeftPaddleSection section={leftSection} onButtonClick={onButtonClick}/>
            <RightPaddleSection section={rightSection} onButtonClick={onButtonClick}/>
        </div>
    )
}
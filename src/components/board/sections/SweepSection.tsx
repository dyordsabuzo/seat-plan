import {BoatLabel, BoatPosition} from "../../../enums/BoatConstant";
import DroppableSection from "../../complex/drag-and-drop/DroppableSection";

type Props = {
    section: any
    onButtonClick?: (item: any, positionId: number, index: number) => void
}

export function SweepSection({section, onButtonClick = null}: Props) {
    return (
        <div className={`flex flex-col items-center p-2`}>
            <DroppableSection section={section}
                              id={BoatPosition.SWEEP}
                              defaultItemLabel={BoatLabel.EMPTY_SEAT}
                              onItemButtonClick={onButtonClick}
            />
        </div>
    )
}
import DroppableSection from "../../complex/drag-and-drop/DroppableSection";
import {BoatPosition} from "../../../enums/BoatConstant";

type Props = {
    section: any
}

export function ReserveSection({section}: Props) {
    return (
        <div className={`ring-1 p-2 rounded-lg`}>
            <h1 className={`text-sm font-medium py-1`}>
                Reserves: {section?.length ?? 0}
            </h1>
            <DroppableSection section={section}
                              id={BoatPosition.RESERVE}
                              sectionClassName={`h-[70vh] overflow-auto`}
            />
        </div>
    )
}
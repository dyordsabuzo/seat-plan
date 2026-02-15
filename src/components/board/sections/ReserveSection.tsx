import DroppableSection from "../../complex/drag-and-drop/DroppableSection";
import {BoatPosition} from "../../../enums/BoatConstant";
import {useState} from "react";
import AddPaddlerModal from "../../complex/modals/AddPaddlerModal";

type Props = {
    section: any,
    onAddPaddler?: (paddler: any) => void
}

export function ReserveSection({section, onAddPaddler}: Props) {
    const [open, setOpen] = useState(false)

    const handleAdd = (paddler: any) => {
        if (onAddPaddler) onAddPaddler(paddler)
    }

    return (
        <div className={`ring-1 p-2 rounded-lg`}>
            <div className={`flex items-center justify-between`}> 
                <h1 className={`text-sm font-medium py-1`}>Reserves: {section?.length ?? 0}</h1>
                <button onClick={() => setOpen(true)} className={`text-sm bg-blue-500 text-white px-2 py-1 rounded`}>Add</button>
            </div>
            <DroppableSection section={section}
                              id={BoatPosition.RESERVE}
                              sectionClassName={`h-[70vh] overflow-auto`}
            />

            <AddPaddlerModal open={open} onClose={() => setOpen(false)} onAdd={handleAdd} />
        </div>
    )
}
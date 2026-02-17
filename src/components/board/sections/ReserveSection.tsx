import DroppableSection from "../../complex/drag-and-drop/DroppableSection";
import {BoatPosition} from "../../../enums/BoatConstant";
import {useState} from "react";
import AddPaddlerModal from "../../complex/modals/AddPaddlerModal";
import { useRegattaState } from '../../../context/RegattaContext'

type Props = {
    section: any,
    onAddPaddler?: (paddler: any) => void
}

export function ReserveSection({section, onAddPaddler}: Props) {
    const [open, setOpen] = useState(false)

    const [regatta] = useRegattaState()

    const handleAdd = (paddler: any) => {
        if (onAddPaddler) onAddPaddler(paddler)
    }

    // prefer explicit `section` prop; otherwise fall back to regatta.paddlers from RegattaContext
    const reserveItems = (section && Array.isArray(section) && section.length > 0)
        ? section
        : (regatta && Array.isArray(regatta.paddlers) ? regatta.paddlers.map((p: any) => ({ ...(p || {}), id: p.id || `p-${String(p.name || Date.now())}`, content: p.name })) : [])

    return (
        <div className={`ring-1 p-2 rounded-lg`}>
            <div className={`flex items-center justify-between`}> 
                <h1 className={`text-sm font-medium py-2`}>Reserves: {reserveItems?.length ?? 0}</h1>
                {/* <button onClick={() => setOpen(true)} className={`text-sm bg-blue-500 text-white px-2 py-1 rounded`}>Add</button> */}
            </div>
            <DroppableSection section={reserveItems}
                              id={BoatPosition.RESERVE}
                              sectionClassName={`h-[70vh] overflow-auto modern-scroll`}
            />

            <AddPaddlerModal open={open} onClose={() => setOpen(false)} onAdd={handleAdd} />
        </div>
    )
}
import { useState } from "react";
import { useRegattaState } from '../../../context/RegattaContext';
import { BoatPosition } from "../../../enums/BoatConstant";
import DroppableSection from "../../complex/drag-and-drop/DroppableSection";
import AddPaddlerModal from "../../complex/modals/AddPaddlerModal";

type Props = {
    section: any,
    onAddPaddler?: (paddler: any) => void
}

export function ReserveSection({section, onAddPaddler}: Props) {
    const [open, setOpen] = useState(false)
    const [panelOpen, setPanelOpen] = useState(false)

    const {state: regatta} = useRegattaState()

    const handleAdd = (paddler: any) => {
        if (onAddPaddler) onAddPaddler(paddler)
    }

    // prefer explicit `section` prop; otherwise fall back to regatta.paddlers from RegattaContext
    const reserveItems = (section && Array.isArray(section) && section.length > 0)
        ? section
        : (regatta && Array.isArray(regatta.paddlers) ? regatta.paddlers.map((p: any) => ({ ...(p || {}), id: p.id || `p-${String(p.name || Date.now())}`, content: p.name })) : [])

    return (
        <>
            {/* Toggle button for small screens */}
            <button
                className="sm:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white px-3 py-2 rounded shadow-lg"
                onClick={() => setPanelOpen(true)}
                aria-label="Open reserves"
            >
                Reserves ({reserveItems?.length ?? 0})
            </button>

            {/* Backdrop for small screens when panel is open */}
            {panelOpen && (
                <div className="fixed inset-0 bg-black/30 z-40 sm:hidden" onClick={() => setPanelOpen(false)} />
            )}

            <div
                className={`ring-1 p-2 rounded-lg z-50 transform transition-transform duration-300 ease-out
                    fixed top-0 right-0 h-full w-11/12 max-w-xs bg-white shadow-lg overflow-auto modern-scroll
                    ${panelOpen ? 'translate-x-0' : 'translate-x-full'}
                        sm:static sm:translate-x-0 sm:h-auto sm:w-auto sm:max-w-none sm:shadow-none sm:bg-transparent sm:overflow-visible`}
                    >
                <div className="flex items-center justify-between"> 
                    <h1 className={`text-sm font-medium py-2`}>Reserves: {reserveItems?.length ?? 0}</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setOpen(true)} className={`text-sm bg-blue-500 text-white px-2 py-1 rounded`}>Add</button>
                        <button className="sm:hidden text-gray-600 px-2 py-1" onClick={() => setPanelOpen(false)} aria-label="Close reserves">✕</button>
                    </div>
                </div>

                <DroppableSection section={reserveItems}
                                  id={BoatPosition.RESERVE}
                                  sectionClassName={`h-[70vh] overflow-auto modern-scroll`}
                />

                <AddPaddlerModal open={open} onClose={() => setOpen(false)} onAdd={handleAdd} />
            </div>
        </>
    )
}
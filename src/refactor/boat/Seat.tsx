import Paddler from '../Paddler';
import { Droppable } from 'react-beautiful-dnd';
import { useState, useEffect, useContext } from 'react';
import BoatContext from '../../context/BoatContext';

type SeatType = {
    seat: string,
    paddler: any | null
}

const Seat: React.FC<SeatType> = ({ seat, paddler }) => {
    const [enabled, setEnabled] = useState(false);
    const boatContext = useContext(BoatContext);

    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));

        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        }
    }, []);

    if (!enabled) {
        return null;
    }

    let seatExtraCss;
    switch (seat) {
        case "drummer":
            seatExtraCss = "rounded-t-2xl overflow-hidden";
            break;
        case "left-1":
            seatExtraCss = "rounded-tl-2xl overflow-hidden";
            break;
        case "left-10":
            seatExtraCss = "rounded-bl-2xl overflow-hidden";
            break;
        case "right-1":
            seatExtraCss = "rounded-tr-2xl overflow-hidden";
            break;
        case "right-10":
            seatExtraCss = "rounded-br-2xl overflow-hidden";
            break;
        case "sweep":
            seatExtraCss = "rounded-b-2xl overflow-hidden";
            break;
        default:
            seatExtraCss = "";
            break;
    }

    return (
        <div className={`
                m-0.5 border-solid border border-black w-44
                rounded-sm flex flex-col
                ${seatExtraCss}
            `}>
            <Droppable droppableId={seat} >
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                            p-2 transition-all h-12
                           ${snapshot.isDraggingOver ? "bg-slate-600" : "bg-amber-500"}
                        `}
                    >
                        {paddler && <Paddler paddler={paddler} index={0} draggable={true} />}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    )
}

export default Seat;
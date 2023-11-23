import {useContext, useState} from "react";
import Paddler from "../Paddler";
import UpdatePaddlerInfo from "../../components/complex/modals/UpdatePaddlerInfo";
import BoatContext from "../../context/BoatContext";
import {Droppable} from "react-beautiful-dnd";

type PaddlerListType = {
    dragFlag: boolean
    paddlers?: []
}

const PaddlerList: React.FC<PaddlerListType> = ({dragFlag, paddlers = []}) => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [paddlerData, setPaddlerData] = useState<any>(null);

    const boatContext = useContext(BoatContext);

    const openModal = (paddler: any) => {
        setPaddlerData(paddler);
        setShowModal(true);
    }

    const handlePaddlerModal = (flag: boolean) => {
        setShowModal(flag);
    }

    const handlePaddlerUpdate = (paddler: any) => {
        boatContext.updatePaddler(paddler);
    }

    // let paddlers = Object.values(boatContext.paddlers as any);

    return (
        <div className={`p-4`}>
            {!dragFlag ? (
                <div className={`p-4`}>
                    <div className={'flex flex-wrap gap-2 text-sm'}>
                        {paddlers.map((paddler: any, index: number) => (
                            <button key={paddler.id} type={"button"} onClick={() => openModal(paddler)}>
                                <Paddler paddler={paddler} index={index} draggable={false}/>
                            </button>
                        ))}
                    </div>
                    {showModal && (
                        <UpdatePaddlerInfo updatePaddlerModal={handlePaddlerModal}
                                           paddler={paddlerData}
                                           updatePaddler={handlePaddlerUpdate}/>
                    )}
                </div>) : (
                <Droppable droppableId={"main"}>
                    {(provided, snapshot) => (
                        <div
                            className={`p-4 transition-all flex flex-col gap-2 text-sm
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                           ${snapshot.isDraggingOver ? "bg-slate-600" : "bg-white"}
                        `}
                        >
                            {paddlers.map((paddler: any, index: number) => (
                                <Paddler key={paddler.id} paddler={paddler} index={index} draggable={true}/>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            )}
        </div>
    );
}

export default PaddlerList;
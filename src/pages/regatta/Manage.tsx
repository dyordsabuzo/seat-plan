import { useState } from "react";
import { logger } from "../../common/helpers/logger";
import Breadcrumb from "../../components/basic/Breadcrumb";
import DataTable, { Column } from "../../components/basic/DataTable";
import { useRegattaState } from "../../context/RegattaContext";
import Tabs from "../../refactor/Tabs";
import { Paddler, Race, Regatta } from "../../types/RegattaType";

const Manage: React.FC = () => {
    const [regatta]: [Regatta] = useRegattaState();
    const [races, setRaces] = useState<Race[]>(regatta.races || []);

    const handleSaveRace = (row: Race) => {
        // TODO
    }

    const deleteRace = (id: string) => {
        logger.debug("Deleting race with id", id)
        const remaining = races.filter(r => r.id !== id)
        setRaces(remaining);
    }

    const deletePaddler = (id: string) => {
        // TODO
    }

    const handleSave = (row: Paddler) => {
        // TODO
    }

    const filtered: Paddler[] = [] // TODO

    return (
        <div className={`p-6 max-w-[900px] mx-auto flex flex-col gap-4`}>
            <header className={`flex items-center justify-between mb-6`}>
                <div>
                    <div className="mb-4 max-w-[900px]">
                        <Breadcrumb items={[{label: 'Home', to: '/'}]} title="Regatta management" backPath={'/'} />
                    </div>
                    <h1 className={`text-2xl font-semibold`}>Regatta race allocations - {regatta.name}</h1>
                    <p className={`text-sm text-gray-500`}>Manage races and race allocations</p>
                </div>
                <div className="">
                    <button onClick={() => {
                        //TODO create new config and navigate to wizard
                    }} className={`px-4 py-2 bg-green-500 text-white rounded`}>New configuration</button>
                </div>
            </header>
            <div> 
                <div className={`mb-2`}>
                    <h1 className={`text-base text-gray-700`}>Races</h1>
                    <p className={`text-xs text-gray-400`}>Manage race allocations</p>
                </div>
                <DataTable
                    data={races}
                    rowKey={'id'}
                    columns={[
                        {key: 'id', title: 'ID'},
                        {key: 'category', title: 'Category', inputType: 'text'},
                        {key: 'type', title: 'Type', inputType: 'text'},
                        {key: 'distance', title: 'Distance (m)', inputType: 'string'},
                        {key: 'boatType', title: 'Boat Type', inputType: 'text'}
                    ] as Column<Race>[]}
                    noEdit={true}
                    onSave={handleSaveRace}
                    onDelete={deleteRace}
                />
            </div>
            <div> 
                <div className={`mb-2`}>
                    <h1 className={`text-base text-gray-700`}>Race allocations</h1>
                    <p className={`text-xs text-gray-400`}>Manage race allocations</p>
                </div>
                <DataTable
                    data={regatta.paddlers}
                    rowKey={'id'}
                    columns={[
                        {key: 'id', title: 'ID'},
                        {key: 'name', title: 'Name', editable: true, inputType: 'text'},
                        {key: 'weight', title: 'Weight (kg)', editable: true, inputType: 'number'},
                        {key: 'gender', title: 'Gender', editable: true, inputType: 'select', options: [{value: 'M', label: 'M'}, {value: 'F', label: 'F'}, {value: 'O', label: 'Other'}]},
                        {key: 'birthdate', title: 'DOB', editable: true, inputType: 'date'}
                    ] as Column<Paddler>[]}
                    onSave={handleSave}
                    onDelete={deletePaddler}
                />
            </div>

        </div>
    )
}

export default Manage;
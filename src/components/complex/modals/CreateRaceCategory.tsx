import {useState} from "react";
import DropdownList from "../../basic/form/DropdownList";
import Input from "../../basic/form/Input";

type CreateRaceCategoryType = {
    categories: string[],
    addCategory: (category: string) => void,
    updateCategoryModal: (flag: boolean) => void
}

const CreateRaceCategory: React.FC<CreateRaceCategoryType> = ({categories, addCategory, updateCategoryModal}) => {
    const [distance, setDistance] = useState<number>(0);
    const [numberOfRaces, setNumberOfRaces] = useState<number>(3);
    const [ageCategory, setAgeCategory] = useState<string>("");
    const [raceType, setRaceType] = useState<string>("");

    return (
        <>
            <div
                className={`
                            justify-center items-center flex overflow-x-hidden overflow-y-auto 
                            fixed inset-0 z-50 outline-none focus:outline-none
                            `}>
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                        <form onSubmit={
                            (e: React.SyntheticEvent) => {
                                e.preventDefault();
                                let categoryName = `${ageCategory} - ${raceType} - ${distance}`;
                                addCategory(categoryName);
                                updateCategoryModal(false);
                            }
                        }>
                            <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                                <h3 className="text-xl font-semibold">
                                    Create Race Category
                                </h3>
                                <button
                                    className={`
                                            p-1 ml-auto bg-transparent border-0 text-black opacity-5 
                                            float-right text-3xl leading-none font-semibold outline-none 
                                            focus:outline-none
                                            `} onClick={() => updateCategoryModal(false)}>
                                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                                        X
                                    </span>
                                </button>
                            </div>

                            <div className="relative p-6 flex-auto space-y-4">
                                <DropdownList id={"ageCategory"} value={ageCategory}
                                              label={"Age category"}
                                              options={
                                                  ["Premier", "Senior A", "Senior B"]
                                              } setValue={setAgeCategory}/>
                                <DropdownList id={"raceType"} value={raceType}
                                              label={"Race type"}
                                              options={
                                                  ["Mixed", "Women", "Men"]
                                              } setValue={setRaceType}/>
                                <div className={`flex space-x-2`}>
                                    <Input id={"distance"} type={"number"} label={"Distance (meters)"}
                                           placeholder={"Distance (meters)"} value={distance}
                                           setNumberValue={setDistance} required/>
                                    <Input id={"numberOfRaces"} type={"number"} label={"Number of races"}
                                           placeholder={"Number of races"} value={numberOfRaces}
                                           setNumberValue={setNumberOfRaces} required/>
                                </div>
                            </div>

                            <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                                <button
                                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                    type="button"
                                    onClick={() => updateCategoryModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                    type="submit"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
    );
}

export default CreateRaceCategory;


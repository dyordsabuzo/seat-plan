import {useContext, useState} from "react";
import PaddlerList from "./tabs/PaddlerList";
import CreateRaceCategory from "../components/complex/modals/CreateRaceCategory";
// import Boat from "./boat/Boat";
// import Setup from "./tabs/Setup";
import BoatContext from "../context/BoatContext";
import BoatConfiguration from "../board/BoatConfiguration";

type PaddlerTabType = {
    categories?: string[],
}

const Tabs: React.FC<PaddlerTabType> = ({categories}) => {
    const [activeTab, setActiveTab] = useState<string>("Player List");
    const [showCategoryModal, setCategoryShowModal] = useState<boolean>(false);
    const [strCategories, setStrCategories] = useState<string[]>(["Player List"]);

    const boatContext = useContext(BoatContext);

    const activeCssTab = `
        text-blue-600 bg-gray-100 active dark:bg-gray-800 dark:text-blue-500
    `;

    const standardCssTab = `
        inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 
        dark:hover:bg-gray-800 dark:hover:text-gray-300
    `;

    const tabClicked = (value: string) => {
        setActiveTab(value);
        boatContext.selectRace(value);
    }

    // const handlePaddlerUpdate = (paddler: any) => {
    //     boatContext.updatePaddler(paddler);
    // }

    const handleAddcategory = (category: string) => {
        boatContext.createRaceCategory(category);

        if (strCategories.indexOf(category) < 0) {
            setStrCategories([
                ...strCategories,
                category
            ]);
        } else {
            console.log(`${category} already exists`);
        }
        setActiveTab(category);
    }

    const handleCategoryModal = (flag: boolean) => {
        setCategoryShowModal(flag);
    }

    return (
        <div>
            <div className={'px-4 space-x-2 text-sm flex items-between place-content-between'}>
                <ul className={`
                    flex flex-nowrap text-sm font-medium text-center text-gray-500 border-b 
                    border-gray-200 dark:border-gray-700 dark:text-gray-400
                `}>
                    {strCategories.map(category => (
                        <li className="mr-2" key={category}>
                            <button
                                className={`
                                    ${standardCssTab}
                                    ${activeTab === category ? activeCssTab : ""}`}
                                onClick={(e) => tabClicked(category)}>{category}</button>
                        </li>
                    ))}
                </ul>
                <button className={`text-sm px-4 py-[1px] rounded-lg bg-blue-600 text-white`}
                        onClick={() => handleCategoryModal(true)}>
                    New Race Category
                </button>
            </div>


            {activeTab === "Player List" ? (
                <PaddlerList dragFlag={false}/>
            ) : (
                <div className={`flex`}>
                    <BoatConfiguration/>
                </div>
                // <Setup/>
            )}

            {showCategoryModal && (
                <CreateRaceCategory categories={strCategories}
                                    addCategory={handleAddcategory}
                                    updateCategoryModal={handleCategoryModal}/>
            )}
        </div>
    )
};

export default Tabs;
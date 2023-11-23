import {useSetupState} from "../../../context/SetupContext";
import {useForm} from "react-hook-form";
import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import {SelectionButton} from "../../../components/basic/buttons/SelectionButton";

export default function BaseWidget({
                                       children = null, fieldName, defaults, navigateTo,
                                       navigateFrom = "", label, lastPage = false
                                   }) {
    const [state, setState] = useSetupState()
    const [elements, setElements] = useState(defaults)

    const {
        handleSubmit,
        register,
        setValue
    } = useForm({defaultValues: state, mode: "onSubmit"});

    const navigate = useNavigate()

    const saveData = (data: any) => {
        const fieldElements = data[fieldName].split(",")

        let raceList = fieldElements
        if (state.raceList) {
            raceList = state.raceList.map((tab: string) => fieldElements.map((item: string) => `${tab}-${item}`)).flat()
        } else {
            navigate('/seat-plan')
        }

        let configs = {}
        raceList.forEach((item: string) => {
            configs[item] = {
                paddlers: [],
                configs: []
            }
        })

        setState({
            ...state,
            ...data,
            raceList,
            configs
        });
        navigate(navigateTo);
    };

    return (
        <div className={`flex justify-center items-center w-full h-[100vh]`}>
            <div className={`flex flex-col items-center content-center w-[30rem] space-y-4`}>
                <h1 className={`font-bold`}>{label}</h1>
                {children === null && (
                    <form onSubmit={handleSubmit(saveData)}
                          className={`flex flex-col space-y-6`}>
                        <div className={` grid grid-cols-2 gap-4 `}>
                            <input {...register(fieldName)}
                                   id={fieldName}
                                   type={"hidden"}
                            />
                            {Object.keys(elements).map(item => (
                                <SelectionButton key={item}
                                                 label={item}
                                                 selected={elements[item]}
                                                 onClick={() => {
                                                     const selection = Object.keys(elements)
                                                         .filter(cat => (elements[cat] || (cat === item && !elements[cat])))
                                                     setElements({
                                                         ...elements,
                                                         [item]: !elements[item]
                                                     })
                                                     setValue(fieldName, selection.join(","))
                                                 }}/>
                            ))}
                        </div>
                        <div className={`relative w-full`}>
                            {navigateFrom !== "" && (<Link className={`
                            absolute left-0
                            text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none 
                            focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2
                        `} to={navigateFrom}>
                                {"<"} Back
                            </Link>)}
                            <button className={`
                            absolute right-0
                            text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none 
                            focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2
                        `}>
                                {lastPage ? "Load" : "Next"}
                            </button>
                        </div>

                    </form>
                )
                }
            </div>
        </div>
    )
}
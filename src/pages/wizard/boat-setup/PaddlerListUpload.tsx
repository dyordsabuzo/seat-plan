import {useSetupState} from "../../../context/SetupContext";
import {Controller, useForm} from "react-hook-form";
import {Link, useNavigate} from "react-router-dom";
import {useContext, useState} from "react";
import BoatContext from "../../../context/BoatContext";
import {processFile} from "../../../utils/DataBuilder";

export default function PaddlerListUpload() {
    const boatContext = useContext(BoatContext);
    const [state, setState] = useSetupState()
    // const [elements, setElements] = useState(defaults)

    const {
        handleSubmit,
        control
    } = useForm({defaultValues: state, mode: "onSubmit"});

    const navigate = useNavigate()

    const saveData = async (data: any) => {
        setState({...state, ...data});

        const file = data.paddlerListFile
        if (file) {
            const paddlers = await processFile(file);
            // set default paddler set on eeach config
            const configs = state.configs
            Object.keys(configs).forEach(key => {
                configs[key].paddlers = paddlers
            })

            setState({
                ...state,
                configs,
                paddlers: Object.keys(paddlers).map(key => paddlers[key])
            })
        }
        navigate("/seat-plan/setupboard");
    };

    return (
        <div className={`flex justify-center items-center w-full h-[100vh]`}>
            <div className={`flex flex-col items-center content-center w-[30rem] space-y-4`}>
                <h1 className={`font-bold`}>Upload paddler listing file</h1>
                <form onSubmit={handleSubmit(saveData)}
                      className={`flex flex-col space-y-6`}>
                    <div className={``}>
                        <Controller
                            control={control}
                            name={"paddlerListFile"}
                            rules={{required: "Recipe picture is required"}}
                            render={({field: {value, onChange, ...field}}) => {
                                return (
                                    <input
                                        {...field}
                                        className={`
                                            block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 
                                            focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 
                                            dark:border-gray-700 dark:text-gray-400 dark:focus:outline-none dark:focus:ring-1 
                                            dark:focus:ring-gray-600
                                            file:border-0 file:bg-gray-100 file:me-4
                                            file:py-3 file:px-4
                                            dark:file:bg-gray-700 dark:file:text-gray-400
                                        `}
                                        value={value?.fileName}
                                        onChange={(event) => {
                                            onChange(event.target.files[0]);
                                        }}
                                        type="file"
                                        id="paddlerListFile"
                                    />
                                );
                            }}
                        />
                    </div>

                    <div className={`relative w-full`}>
                        {/*{navigateFrom !== "" && (<Link className={`*/}
                        {/*    absolute left-0*/}
                        {/*    text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none */}
                        {/*    focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2*/}
                        {/*`} to={navigateFrom}>*/}
                        {/*    {"<"} Back*/}
                        {/*</Link>)}*/}
                        <button className={`
                            absolute right-0
                            text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none 
                            focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2
                        `}>
                            {/*{lastPage ? "Load" : "Next"}*/}
                            Next
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
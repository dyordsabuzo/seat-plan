import {useSetupState} from "../../../context/SetupContext";
import {Controller, useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {processFile} from "../../../utils/DataBuilder";

export default function PaddlerListUpload() {
    // const boatContext = useContext(BoatContext);
    const [state, setState] = useSetupState()
    // const [elements, setElements] = useState(defaults)

    const {
        handleSubmit,
        control
    } = useForm({defaultValues: state, mode: "onSubmit"});

    const [mode, setMode] = useState<'upload'|'manual'>('upload');
    const [manualText, setManualText] = useState('');

    const navigate = useNavigate()

    const saveData = async (data: any) => {
        setState({...state, ...data});

        const file = data.paddlerListFile
        let paddlers: any = {};

        if (mode === 'upload') {
            if (file) {
                paddlers = await processFile(file);
            } else {
                alert('Please select a file or switch to Manual entry');
                return;
            }
        } else {
            // parse manualText: expect CSV per line: id,name,weight,gender,birthdate
            const lines = manualText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            lines.forEach((line, idx) => {
                const parts = line.split(',').map(p => p.trim());
                const id = parts[0] || `m-${idx}`;
                const name = parts[1] || `Paddler ${idx + 1}`;
                const weight = parts[2] ? parseInt(parts[2]) : undefined;
                const gender = parts[3] || undefined;
                const birthdate = parts[4] || undefined;
                paddlers[id] = {
                    id,
                    name,
                    weight,
                    gender,
                    birthdate
                };
            })
        }

        if (paddlers && Object.keys(paddlers).length > 0) {
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
        navigate("/setupboard");
    };

    return (
        <div className={`flex justify-center items-center w-full h-[100vh]`}>
            <div className={`flex flex-col items-center content-center w-[30rem] space-y-4`}>
                <h1 className={`font-bold`}>Paddler list</h1>
                <div className={`flex space-x-2`}> 
                    <button type="button" onClick={() => setMode('upload')} className={`px-3 py-1 rounded ${mode==='upload' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Upload file</button>
                    <button type="button" onClick={() => setMode('manual')} className={`px-3 py-1 rounded ${mode==='manual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Enter manually</button>
                </div>
                <form onSubmit={handleSubmit(saveData)}
                      className={`flex flex-col space-y-6`}>
                    {mode === 'upload' && (
                        <div className={``}>
                            <Controller
                                control={control}
                                name={"paddlerListFile"}
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
                    )}

                    {mode === 'manual' && (
                        <div className={`w-full`}> 
                            <label className={`block text-sm font-medium mb-1`}>Paste paddlers (one per line): <span className={`text-xs font-normal`}>id,name,weight,gender,birthdate</span></label>
                            <textarea value={manualText} onChange={(e) => setManualText(e.target.value)} rows={8} className={`block w-full border border-gray-200 rounded-lg p-2`}></textarea>
                            <div className={`text-xs text-gray-500 mt-1`}>Example: <span className={`italic`}>12345,John D,78,M,1990-01-01</span></div>
                        </div>
                    )}

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
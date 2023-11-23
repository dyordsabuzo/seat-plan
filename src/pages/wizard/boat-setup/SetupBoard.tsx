import {useEffect, useState} from "react";
import {useSetupState} from "../../../context/SetupContext";
import {ListWidget} from "../../../components/complex/widgets/ListWidget";
import MainBoard from "../../../components/board/MainBoard";
import {useNavigate} from "react-router-dom";

export function SetupBoard() {
    const [state, setState] = useSetupState()
    const [selection, setSelection] = useState(null)
    const [boardProperties, setBoardProperties] = useState<any>(null)

    const navigate = useNavigate()

    // useEffect(() => {
    //     if (!("raceList" in state)) {
    //         navigate('/seat-plan')
    //     } else {
    //         setSelection(state.raceList[0])
    //     }
    //     return () => {
    //     }
    // }, [state, navigate]);

    // useEffect(() => {
    //     if (selection && state.configs) {
    //         if (selection in state.configs) {
    //             setBoardConfigs(state.configs[selection])
    //         }
    //     }
    //     return () => {
    //     }
    // }, [selection, state.configs]);

    // useEffect(() => {
    //     if (selection) {
    //         const {paddlers, configs} = state
    //
    //         if (!configs || selection ! in configs) {
    //             const [ageCategory, genderCategory, distance, boatType] = selection.split("-")
    //             const _paddlers: any = Array.from(paddlers.map((paddler: any) => ({
    //                 ...paddler,
    //                 content: paddler.name
    //             })))
    //
    //             const boatSize = BoatSize[boatType.toUpperCase()]
    //             const _configs = Array.from({length: 3}, (value, index) => {
    //                 return [
    //                     getItems(1, 0, "scratch"),
    //                     getItems(1, 1, "drummer"),
    //                     getItems(boatSize, boatSize, "left"),
    //                     getItems(boatSize, boatSize, "right"),
    //                     getItems(1, 1, "sweep")
    //                 ]
    //             })
    //
    //             // setState({
    //             //     ...state,
    //             //     configs: {
    //             //         [selection]: {
    //             //             paddlers: _paddlers,
    //             //             configs: _configs
    //             //         }
    //             //     }
    //             // })
    //
    //             setBoardConfigs({
    //                 paddlers: _paddlers,
    //                 configs: _configs
    //             })
    //         }
    //     }
    //     return () => {
    //     }
    // }, [selection, state]);

    useEffect(() => {
        if (state.configs) {
            setSelection(Object.keys(state.configs)[0])
        }
        return () => {
        }
    }, [state.configs]);

    useEffect(() => {
        if (selection) {
            const [ageCategory, genderCategory, distance, boatType] = selection.split("-")
            setBoardProperties({
                ageCategory,
                genderCategory,
                distance,
                boatType
            })
        }
        return () => {
        }
    }, [selection]);

    const handleSelection = (value: string) => {
        const [ageCategory, genderCategory, distance, boatType] = value.split("-")
        setSelection(value)
        setBoardProperties({
            ageCategory,
            genderCategory,
            distance,
            boatType
        })
        // setBoardConfigs(state.configs[value])
    }

    const handleUpdateConfig = (index: number, config: any) => {
        console.log("update config")
        // const selectedConfig = state.configs[selection]
        // if (selectedConfig.configs.length < index + 1) {
        //     selectedConfig.configs.push(config)
        // } else {
        //     selectedConfig.configs.splice(index, 1)
        //     selectedConfig.configs.splice(index, 0, config)
        // }


        const configs = state.configs
        if (configs[selection].configs.length < index + 1) {
            configs[selection].configs.push(config)
        } else {
            configs[selection].configs.splice(index, 1)
            configs[selection].configs.splice(index, 0, config)
        }

        console.log(configs)

        setState({
            ...state,
            configs
        })

        // const selectedConfig = state.configs[selection] ?? {}
        // if (selectedConfig) {
        //     selectedConfig.config.splice(index, 1)
        //     selectedConfig.config.splice(index, 0, config)
        //     setState({
        //         ...state,
        //         configs: {
        //             [selection]: selectedConfig
        //         }
        //     })
        // } else {
        //     console.log("selected Config not set")
        // }
    }

    if (state.configs) {
        console.log(state.configs, selection, state.configs[selection], boardProperties)
    }


    return (
        <div className={`p-8`}>
            {!boardProperties && (
                <div className={`flex flex-col items-center`}>
                    <span>Loading</span>
                    <button className={`bg-teal-200 ring-1 p-2`} onClick={() => {
                        navigate('/')
                    }}>Cancel
                    </button>
                </div>
            )}
            {boardProperties && (
                <div className={`flex justify-center`}>
                    <MainBoard
                        boardConfigs={state.configs[selection]}
                        boardProperties={boardProperties}
                        onUpdateConfig={handleUpdateConfig}
                    />
                    <div>
                        <ListWidget label={"Race listing"}
                                    items={state.raceList ?? []}
                                    selectedIndex={state.raceList.indexOf(selection) + 1}
                                    setSelection={handleSelection}
                        />
                    </div>

                </div>
            )}
        </div>
    )
};

export default SetupBoard;
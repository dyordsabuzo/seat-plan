import {createContext, useContext, useState} from "react";

export const SetupStateContext = createContext({})

const setDefaultSettings = () => {
    return {
        sideWeightFactor: {
            STANDARD: [300, 330, 350, 350, 350, 350, 350, 350, 330, 300, 420],
            SMALL: [300, 330, 350, 330, 300, 420]
        },
        lineWeightFactor: {
            STANDARD: [6, 4.5, 3.5, 2.5, 1.5, 0.5, -0.5, -1.5, -2.5, -3.5, -4.5, -6],
            SMALL: [6, 2.5, 1.5, 0.5, -1.5, -2.5, -6]
        },
        defaultDrumWeight: 14,
        defaultSweepWeight: 7
    };
}

export function SetupProvider({children}) {
    const value = useState({
        settings: setDefaultSettings(),
    })

    return (
        <SetupStateContext.Provider value={value}>
            {children}
        </SetupStateContext.Provider>
    )
}

export function useSetupState() {
    const context: any = useContext(SetupStateContext)
    if (!context) {
        throw new Error("useSetupState must be used within the SetupProvider");
    }
    return context;
}
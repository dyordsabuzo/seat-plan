import { createContext, useContext, useState } from "react";
import { calculateLineBalance, calculateSideBalance } from "../utils/WeightCalculator";
// import Boat from "../refactor/boat/Boat";

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
        oarWeightOffset: 3,
        defaultDrumWeight: 14,
        defaultSweepWeight: 7,
        sideWeightTolerance: 5,
        lineWeightTolerance: 10
    };
}

export function SetupProvider({children}) {
    const [state, setState] = useState({
        settings: setDefaultSettings(),
    })

    const setWeightFactor = (boatType: string) => {
        return {
            sideWeightFactor: state.settings?.sideWeightFactor[boatType.toUpperCase()],
            lineWeightFactor: state.settings?.lineWeightFactor[boatType.toUpperCase()]
        }
    }

    const checkBoatBalance = (boardSetup: any, boatType: string) => {
        const settings = {
            ...state.settings,
            ...setWeightFactor(boatType)
        }
        
        const sideBalance = calculateSideBalance(boardSetup, settings)
        const lineBalance = calculateLineBalance(boardSetup, settings)

        return {sideBalance, lineBalance};
    }

    const value: any = { state, setState, checkBoatBalance };

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
import { createContext, useCallback, useContext, useState } from "react";
import { BoatPosition } from "../enums/BoatConstant";
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

    const checkBoatBalance = useCallback((boardSetup: any, boatType: string) => {
        const settings = {
            ...state.settings,
            ...setWeightFactor(boatType)
        }

        const boatProps = {
            menCount: 0,
            womenCount: 0,
            totalPaddlers: 0,
            totalPaddlersWeight: 0,
            totalLoadWeight: 0,
            averagePaddlerWeight: 0,
            averageLoadPerPaddler: 0
        };
        
        const sideBalance = calculateSideBalance(boardSetup, settings);
        const lineBalance = calculateLineBalance(boardSetup, settings);

        [...boardSetup[BoatPosition.LEFT], ...boardSetup[BoatPosition.RIGHT]].forEach((p: any) => {
            if (!p) return;
            if (p.gender === 'M') boatProps.menCount += 1;
            if (p.gender === 'F') boatProps.womenCount += 1;

            if (p.weight > 0) boatProps.totalPaddlers += 1;

            boatProps.totalPaddlersWeight += parseInt(p.weight ?? 0);
        });

        boatProps.totalLoadWeight = boatProps.totalPaddlersWeight + 
            (boardSetup[BoatPosition.DRUMMER][0]?.weight ?? 0) +
            (boardSetup[BoatPosition.SWEEP][0]?.weight ?? 0);
        
        if (boatProps.totalPaddlers > 0) {
            boatProps.averagePaddlerWeight = boatProps.totalPaddlersWeight / boatProps.totalPaddlers;
            boatProps.averageLoadPerPaddler = boatProps.totalLoadWeight / boatProps.totalPaddlers;
        }

        setState((prev: any) => ({
            ...prev,
            sideBalance,
            lineBalance,
            boatProps: {
                ...prev.boatProps,
                ...boatProps
            }
        }));

        // return value intentionally omitted — callers read results via context state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.settings]);

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
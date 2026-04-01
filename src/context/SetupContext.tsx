import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BoatPosition } from "../enums/BoatConstant";
import { calculateLineBalance, calculateSideBalance } from "../utils/WeightCalculator";

export const SetupStateContext = createContext({})

const SETUP_SETTINGS_STORAGE_KEY = "setup-settings-v1";

export const setDefaultSettings = () => {
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

const toNumberArray = (input: unknown, fallback: number[]) => {
    if (!Array.isArray(input)) return fallback;
    const parsed = input
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));
    return parsed.length > 0 ? parsed : fallback;
};

const normaliseSettings = (candidate?: any) => {
    const defaults = setDefaultSettings();
    const raw = candidate ?? {};

    return {
        ...defaults,
        ...raw,
        sideWeightFactor: {
            ...defaults.sideWeightFactor,
            ...(raw.sideWeightFactor ?? {}),
            STANDARD: toNumberArray(raw?.sideWeightFactor?.STANDARD, defaults.sideWeightFactor.STANDARD),
            SMALL: toNumberArray(raw?.sideWeightFactor?.SMALL, defaults.sideWeightFactor.SMALL),
        },
        lineWeightFactor: {
            ...defaults.lineWeightFactor,
            ...(raw.lineWeightFactor ?? {}),
            STANDARD: toNumberArray(raw?.lineWeightFactor?.STANDARD, defaults.lineWeightFactor.STANDARD),
            SMALL: toNumberArray(raw?.lineWeightFactor?.SMALL, defaults.lineWeightFactor.SMALL),
        },
        oarWeightOffset: Number.isFinite(Number(raw.oarWeightOffset)) ? Number(raw.oarWeightOffset) : defaults.oarWeightOffset,
        defaultDrumWeight: Number.isFinite(Number(raw.defaultDrumWeight)) ? Number(raw.defaultDrumWeight) : defaults.defaultDrumWeight,
        defaultSweepWeight: Number.isFinite(Number(raw.defaultSweepWeight)) ? Number(raw.defaultSweepWeight) : defaults.defaultSweepWeight,
        sideWeightTolerance: Number.isFinite(Number(raw.sideWeightTolerance)) ? Number(raw.sideWeightTolerance) : defaults.sideWeightTolerance,
        lineWeightTolerance: Number.isFinite(Number(raw.lineWeightTolerance)) ? Number(raw.lineWeightTolerance) : defaults.lineWeightTolerance,
    };
};

const readStoredSettings = () => {
    try {
        const stored = window.localStorage.getItem(SETUP_SETTINGS_STORAGE_KEY);
        if (!stored) return setDefaultSettings();
        return normaliseSettings(JSON.parse(stored));
    } catch {
        return setDefaultSettings();
    }
};

const resolveBoatTypeKey = (boatType: string) => {
    const normalised = String(boatType ?? "").trim().toUpperCase();
    return normalised === "SMALL" ? "SMALL" : "STANDARD";
};

export function SetupProvider({children}) {
    const [state, setState] = useState({
        settings: readStoredSettings(),
    })

    useEffect(() => {
        try {
            window.localStorage.setItem(SETUP_SETTINGS_STORAGE_KEY, JSON.stringify(state.settings));
        } catch {
            return;
        }
    }, [state.settings]);

    const setSettings = useCallback((nextSettingsOrUpdater: any) => {
        setState((previous: any) => {
            const nextSettings = typeof nextSettingsOrUpdater === "function"
                ? nextSettingsOrUpdater(previous.settings)
                : nextSettingsOrUpdater;

            return {
                ...previous,
                settings: normaliseSettings(nextSettings),
            };
        });
    }, []);

    const resetSettings = useCallback(() => {
        setState((previous: any) => ({
            ...previous,
            settings: setDefaultSettings(),
        }));
    }, []);

    const setWeightFactor = (boatType: string) => {
        const typeKey = resolveBoatTypeKey(boatType);
        return {
            sideWeightFactor: state.settings?.sideWeightFactor?.[typeKey],
            lineWeightFactor: state.settings?.lineWeightFactor?.[typeKey]
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

    const value: any = useMemo(() => ({
        state,
        setState,
        checkBoatBalance,
        setSettings,
        resetSettings,
        defaultSettings: setDefaultSettings(),
    }), [state, checkBoatBalance, setSettings, resetSettings]);

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
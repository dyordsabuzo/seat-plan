import { createContext, useContext, useEffect, useState } from "react";
// import ConfigHelper from '../utils/ConfigHelper'
// import {useSetupState} from './SetupContext'
import { logger } from "../common/helpers/logger";
import { Race, Regatta } from "../types/RegattaType";

export const RegattaStateContext = createContext(null)

export function RegattaProvider({children}) {
    const [state, setState] = useState<Regatta | null>(null)

    // const value: any = [state, setState, actions]
    useEffect(() => {
        try {
            if (state && state.name) {
                logger.debug("Saving regatta state to localStorage", state);
                const raw = localStorage.getItem('regattaConfigs')
                const existing = raw ? JSON.parse(raw) : {}
                const merged = {...existing, [state.name]: state}
                localStorage.setItem('regattaConfigs', JSON.stringify(merged))
            }
        } catch (e) {
            logger.debug('localStorage save failed', e)
        }
        return () => {};
    }, [state]);

    const persistState = () => {
        try {
            if (state && state.name) {
                logger.debug("Saving regatta state to localStorage", state);
                const raw = localStorage.getItem('regattaConfigs')
                const existing = raw ? JSON.parse(raw) : {}
                const merged = {...existing, [state.name]: state}
                localStorage.setItem('regattaConfigs', JSON.stringify(merged))
            }
        } catch (e) {
            logger.debug('localStorage save failed', e)
        }
    }

    const updateRaceConfig = (race:Race) => {
        logger.debug("Updating race configurations for race", race)
        const raceToUpdate = state.races.findIndex(item => item.id === race.id);
        if (raceToUpdate !== -1) {
            state.races[raceToUpdate] = race;
        }
        persistState();
        logger.debug("Post updating race configurations for race", race)
    }

    const value: any = {state, setState, updateRaceConfig}

    return (
        <RegattaStateContext.Provider value={value}>
            {children}
        </RegattaStateContext.Provider>
    )
}

export function useRegattaState() {
    const context: any = useContext(RegattaStateContext)
    if (!context) {
        throw new Error("useRegattaState must be used within the RegattaProvider");
    }
    return context;
}

export default RegattaProvider

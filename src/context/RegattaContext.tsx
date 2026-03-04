import { createContext, useContext, useEffect, useState } from "react";
// import ConfigHelper from '../utils/ConfigHelper'
// import {useSetupState} from './SetupContext'
import { logger } from "../common/helpers/logger";
import { Race, Regatta } from "../types/RegattaType";
import * as RegattasStorage from '../utils/RegattasStorage';
import { useAuth } from './AuthContext';

export const RegattaStateContext = createContext(null)

export function RegattaProvider({children}) {
    const [state, setState] = useState<Regatta | null>(null)
    const { user } = useAuth()

    // const value: any = [state, setState, actions]
    useEffect(() => {
        // eslint-disable-next-line
        let mounted = true
        const save = async () => {
            try {
                if (state && state.name) {
                    logger.debug("Persisting regatta state", state);
                    if (user && user.uid) {
                        // persist to Firestore (top-level regattas when no club association)
                        try {
                            await RegattasStorage.upsertRegatta(user.uid, undefined, state)
                            logger.debug('Regatta persisted to Firestore', state.name)
                        } catch (e) {
                            logger.debug('Failed to persist regatta to Firestore, falling back to localStorage', e)
                            const raw = localStorage.getItem('regattaConfigs')
                            const existing = raw ? JSON.parse(raw) : {}
                            const merged = {...existing, [state.name]: state}
                            localStorage.setItem('regattaConfigs', JSON.stringify(merged))
                        }
                    } else {
                        // unauthenticated: persist locally
                        const raw = localStorage.getItem('regattaConfigs')
                        const existing = raw ? JSON.parse(raw) : {}
                        const merged = {...existing, [state.name]: state}
                        localStorage.setItem('regattaConfigs', JSON.stringify(merged))
                    }
                }
            } catch (e) {
                logger.debug('persist regatta failed', e)
            }
        }
        save()
        return () => { mounted = false }
    }, [state, user]);

    const persistState = () => {
        try {
            if (state && state.name) {
                logger.debug("Persisting regatta state (manual)", state);
                if (user && user.uid) {
                    RegattasStorage.upsertRegatta(user.uid, undefined, state).catch(e => {
                        logger.debug('Manual persist to Firestore failed', e)
                    })
                } else {
                    const raw = localStorage.getItem('regattaConfigs')
                    const existing = raw ? JSON.parse(raw) : {}
                    const merged = {...existing, [state.name]: state}
                    localStorage.setItem('regattaConfigs', JSON.stringify(merged))
                }
            }
        } catch (e) {
            logger.debug('persistState failed', e)
        }
    }

    const updateRaceConfig = (race:Race) => {
        const raceToUpdate = state.races.findIndex(item => item.id === race.id);
        if (raceToUpdate !== -1) {
            state.races[raceToUpdate] = race;
        }
        persistState();
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

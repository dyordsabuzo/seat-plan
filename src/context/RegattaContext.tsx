import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
// import ConfigHelper from '../utils/ConfigHelper'
// import {useSetupState} from './SetupContext'
import { logger } from "../common/helpers/logger";
import useRegattas from "../hooks/useRegattas";
import { Race, Regatta } from "../types/RegattaType";

export const RegattaStateContext = createContext(null)

export function RegattaProvider({children}) {
    const [state, setState] = useState<Regatta | null>(null)
    const [clubId, setClubId] = useState<string | null>(null)
    const lastSavedStateRef = useRef<string | null>(null)
    const { upsertRegatta } = useRegattas(clubId)

    // const value: any = [state, setState, actions]
    useEffect(() => {
        if (!state?.name) return undefined

        const serializedState = JSON.stringify(state)
        if (lastSavedStateRef.current === serializedState) {
            return undefined
        }

        const timeout = window.setTimeout(() => {
            upsertRegatta(state)
                .then(() => {
                    lastSavedStateRef.current = serializedState
                })
                .catch(error => {
                    logger.debug('persist regatta failed', error)
                })
        }, 400)

        return () => window.clearTimeout(timeout)
    }, [state, upsertRegatta]);

    const persistState = useCallback(async (nextState = state) => {
        if (!nextState?.name) return

        return upsertRegatta(nextState)
            .then(() => {
                lastSavedStateRef.current = JSON.stringify(nextState)
            })
            .catch(error => {
                logger.debug('persistState failed', error)
            })
    }, [state, upsertRegatta])

    const updateRaceConfig = useCallback((race:Race) => {
        setState(prev => {
            if (!prev?.races) return prev
            const nextRaces = prev.races.map(item => item.id === race.id ? race : item)
            return {
                ...prev,
                races: nextRaces,
            }
        })
    }, [])

    const value = useMemo(() => ({state, setState, clubId, setClubId, updateRaceConfig, persistState}), [state, clubId, persistState, updateRaceConfig])

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

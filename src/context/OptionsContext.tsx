import React, { createContext, useContext, useEffect, useState } from 'react'
import { logger } from '../common/helpers/logger'

type OptionsState = {
    categories: string[]
    types: string[]
    distances: string[]
    boatTypes: string[]
    genders: string[]
}

type OptionsContextType = {
    options: OptionsState
    setOptions: (next: Partial<OptionsState>) => void
    addOption: (key: keyof OptionsState, value: string) => void
}

const defaultOptions: OptionsState = { 
    categories: ["Juniors", "U24", "Premier", "Senior A", "Senior B", "Senior C", "BCS"], 
    types: ["Womens", "Opens", "Mixed"], 
    distances: ["200m", "500m", "1000m", "2000m"], 
    boatTypes: ["Small", "Standard"],
    genders: ["M", "F"]
}

const OptionsContext = createContext<OptionsContextType | null>(null)

export const OptionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [options, setOptionsState] = useState<OptionsState>(() => {
        // try {
        //     const raw = localStorage.getItem('seatplan.options')
        //     if (raw) return { ...defaultOptions, ...(JSON.parse(raw) as Partial<OptionsState>) }
        // } catch (_) {}

        logger.debug("Initialized options state with default values", defaultOptions)
        return defaultOptions
    })

    useEffect(() => {
        try {
            localStorage.setItem('seatplan.options', JSON.stringify(options))
        } catch (_) {}
    }, [options])

    const setOptions = (next: Partial<OptionsState>) => {
        setOptionsState(prev => ({ ...prev, ...next }))
    }

    const addOption = (key: keyof OptionsState, value: string) => {
        if (!value) return
        setOptionsState(prev => {
            const curr = prev[key] || []
            if (curr.includes(value)) return prev
            return { ...prev, [key]: [...curr, value] }
        })
    }

    return (
        <OptionsContext.Provider value={{ options, setOptions, addOption }}>
            {children}
        </OptionsContext.Provider>
    )
}

export function useOptions() {
    const ctx = useContext(OptionsContext)
    if (!ctx) throw new Error('useOptions must be used within OptionsProvider')

    logger.debug("useOptions accessed with current options", ctx.options)
    return ctx
}

export default OptionsContext

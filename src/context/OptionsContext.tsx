import React, { createContext, useContext, useState, useEffect } from 'react'

type OptionsState = {
    categories: string[]
    types: string[]
    distances: string[]
    boatTypes: string[]
}

type OptionsContextType = {
    options: OptionsState
    setOptions: (next: Partial<OptionsState>) => void
    addOption: (key: keyof OptionsState, value: string) => void
}

const defaultOptions: OptionsState = { categories: [], types: [], distances: [], boatTypes: [] }

const OptionsContext = createContext<OptionsContextType | null>(null)

export const OptionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [options, setOptionsState] = useState<OptionsState>(() => {
        try {
            const raw = localStorage.getItem('seatplan.options')
            if (raw) return { ...defaultOptions, ...(JSON.parse(raw) as Partial<OptionsState>) }
        } catch (_) {}
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
    return ctx
}

export default OptionsContext

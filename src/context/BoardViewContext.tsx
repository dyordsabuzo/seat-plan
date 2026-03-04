import { createContext, useContext, useState } from "react";

export const BoardViewContext = createContext({})

const setDefaultSettings = () => {
    return {
        showWeights: true,
        maxConfig: 5
    };
}

export function BoardViewProvider({children}) {
    const [state, setState] = useState({
        settings: setDefaultSettings(),
    })

    const value: any = { state, setState };

    return (
        <BoardViewContext.Provider value={value}>
            {children}
        </BoardViewContext.Provider>
    )
}

export function useBoardView() {
    const context: any = useContext(BoardViewContext)
    if (!context) {
        throw new Error("useBoardView must be used within the BoardViewProvider");
    }
    return context;
}
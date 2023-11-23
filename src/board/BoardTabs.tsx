import React, {useEffect, useState} from "react";
import BoardTabItem from "./BoardTabItem";
import {useSetupState} from "../context/SetupContext";
import {For} from "million/react";
import {ListWidget} from "../components/complex/widgets/ListWidget";

export default function BoardTabs() {
    const [state, setState] = useSetupState()

    const handleTabClick = (value: string) => {
        setState({
            ...state,
            activeTab: value
        })
    }

    return (

        <div className={`p-4 space-x-2 text-sm w-[85%] overflow-hidden`}>
            <ul className={`
                overflow-auto
                flex flex-nowrap text-sm font-medium text-center text-gray-500 border-b 
                border-gray-200 dark:border-gray-700 dark:text-gray-400
            `}>
                {["Player List"].concat(state.tabs).map(
                    (tab: string) => (
                        <BoardTabItem
                            key={tab}
                            tabName={tab}
                            activeTab={(state.activeTab ?? "Player List")}
                            onClickTab={handleTabClick}
                        />
                    ))}
            </ul>
        </div>
    )
}
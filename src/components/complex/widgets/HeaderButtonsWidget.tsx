import {HeaderButton} from "../../basic/buttons/HeaderButton";
import React from "react";

type Props = {
    names: string[]
    clickedIndex: number
    onClick: (index: number) => void
    addHeaderHandler: () => void
}

export function HeaderButtonsWidget({names, clickedIndex = 0, onClick, addHeaderHandler}: Props) {
    return (
        <div className={`w-full flex py-4 pb-8 gap-2`}>
            {names.map((name, index) => (
                <HeaderButton key={index}
                              label={name}
                              isClicked={(index === clickedIndex)}
                              onClick={() => onClick(index)}
                />
            ))}
            <button className={`
                            font-semibold rounded-lg text-xs
                            px-6 py-2 text-center
                            ${names.length >= 3 ? "cursor-not-allowed" : ""}
                        `}
                    onClick={() => addHeaderHandler()}
                    type={"button"}
                    disabled={names.length >= 3}
            >
                +Add Config
            </button>
        </div>
    )
}
import {block} from "million/react";

type Props = {
    tabName: string
    activeTab: string
    onClickTab: (value: string) => void
}

const BoardTabItem: React.FC<Props> = ({tabName, activeTab, onClickTab}: Props) => {
    return (
        <li className="mr-2">
            <button
                className={`
                    text-sm
                    whitespace-nowrap inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-teal-200
                    dark:hover:bg-gray-800 dark:hover:text-gray-300
                    ${activeTab === tabName && "text-white bg-teal-600 active dark:bg-gray-800 dark:text-blue-500"}
                `}
                onClick={(e) => {
                    onClickTab(tabName)
                }}>
                {tabName}
            </button>
        </li>
    )
}

export default BoardTabItem;
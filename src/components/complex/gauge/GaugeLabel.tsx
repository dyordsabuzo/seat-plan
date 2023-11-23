export default function GaugeLabel({
                                       horizontal = false,
                                       gaugeValue,
                                       textValue,
                                       position = 0
                                   }) {

    return (
        <div className={`
                    absolute 
                    transition-all
                    whitespace-nowrap
                    ${horizontal ? '-rotate-90 -left-3' : 'left-1.5'}
                    text-gray-900 ring-2 ring-slate-400 
                    dark:focus:ring-teal-700 font-medium rounded-lg text-xs 
                    py-1 px-2 text-center
                    top-[${position}%]
            `}>
                    {/*top-[${(97 - gaugeValue)}%]*/}
            {textValue}
        </div>
    )

}
export default function HorizontalLineGauge({
                                                GHeight = 10,
                                                value = 0,
                                                toleranceMin,
                                                toleranceMax,
                                                textValue = `${value} kg`
                                            }) {

    const calcPos = () => {
        const percentMin = 37
        const percentMax = 63
        const step = (toleranceMax - toleranceMin) / (percentMax - percentMin)

        if (value < toleranceMin) {
            const totalSteps = (toleranceMin - value) / step
            return {
                pos: `${Math.max(percentMin - totalSteps, 0)}%`,
                labelPos: `${Math.max((percentMin - 5) - totalSteps, 0)}%`
            }
        } else {
            const totalSteps = (value - toleranceMin) / step
            return {
                pos: `${Math.min(percentMin + totalSteps, 100)}%`,
                labelPos: `${Math.min((percentMin - 5) + totalSteps, 87)}%`
            }
        }
    }

    return (
        <div className={`flex flex-col items-center pb-2`}>
            <svg width={"100%"} height={GHeight}>
                <defs>
                    <linearGradient
                        id="gradient" x1="0%" y1="0%" x2="100%" y2="0%" spreadMethod="pad">
                        <stop offset="0%" stopColor="#ff2400" stopOpacity="1"></stop>
                        <stop offset="45%" stopColor="#33FF54" stopOpacity="1"></stop>
                        <stop offset="55%" stopColor="#33FF54" stopOpacity="1"></stop>
                        <stop offset="100%" stopColor="#ff2400" stopOpacity="1"></stop>
                    </linearGradient>
                </defs>
                <g>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#gradient)"></rect>
                </g>
                <g>
                    <line y1={50}
                          x1={calcPos().pos}
                          y2="0"
                          x2={calcPos().pos}
                          strokeWidth="10"
                          stroke="white"></line>
                </g>
            </svg>
            <svg width={"100%"} height={20}>
                <g>
                    <text
                        x={calcPos().labelPos}
                        y={"80%"}
                    >
                        <tspan className={`text-sm`}>{textValue}</tspan>
                    </text>
                </g>
            </svg>
        </div>
    )
}
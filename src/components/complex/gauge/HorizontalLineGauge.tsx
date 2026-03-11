import { useMemo } from 'react'

export default function HorizontalLineGauge({
                                                GHeight = 10,
                                                value = 0,
                                                toleranceMin = 0,
                                                toleranceMax = 100,
                                                textValue = `${value} kg`
                                            }) {

    const id = useMemo(() => `hg-${Math.random().toString(36).slice(2,8)}`, [])

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
                        id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%" spreadMethod="pad">
                        <stop offset="0%" stopColor="#ff2400" stopOpacity="1"></stop>
                        <stop offset="45%" stopColor="#33FF54" stopOpacity="1"></stop>
                        <stop offset="55%" stopColor="#33FF54" stopOpacity="1"></stop>
                        <stop offset="100%" stopColor="#ff2400" stopOpacity="1"></stop>
                    </linearGradient>
                </defs>
                <g>
                    <rect x={0} y={0} width="100%" height="100%" fill={`url(#grad-${id})`}  rx={4} ry={4} ></rect>
                </g>
                <g>
                    <line x1={calcPos().pos}
                          x2={calcPos().pos}
                          y1={"0%"}
                          y2={"100%"}
                          strokeWidth={Math.max(2, GHeight)}
                          stroke="white"></line>
                </g>
            </svg>
            <div style={{width: '100%', height: 20, position: 'relative'}}>
                <div style={{position: 'absolute', left: calcPos().labelPos, top: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none'}}>
                    <span className={`text-xs bg-white px-2 py-0.5 rounded font-semibold border shadow-md`}>{String(textValue).replace(' ', '')}</span>
                </div>
            </div>
        </div>
    )
}
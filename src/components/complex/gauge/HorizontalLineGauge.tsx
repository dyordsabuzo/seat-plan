import { useId } from 'react'

export default function HorizontalLineGauge({
    GHeight = 10,
    value = 0,
    toleranceMin = 0,
    toleranceMax = 100,
    textValue = `${value} kg`
}) {
    const uid = useId()

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

    const { pos, labelPos } = calcPos()

    return (
        <div className="flex flex-col items-center pb-2">
            <svg width="100%" height={GHeight}>
                <defs>
                    <linearGradient
                        id={`hgrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%" spreadMethod="pad">
                        <stop offset="0%"   stopColor="#ef4444" stopOpacity="1" />
                        <stop offset="40%"  stopColor="#22c55e" stopOpacity="1" />
                        <stop offset="60%"  stopColor="#22c55e" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
                    </linearGradient>
                </defs>
                <rect x={0} y={0} width="100%" height="100%" fill={`url(#hgrad-${uid})`} rx={4} ry={4} />
                <line
                    x1={pos} x2={pos} y1="0%" y2="100%"
                    strokeWidth={Math.max(2, GHeight)} stroke="white" strokeOpacity="0.85"
                />
            </svg>
            <div style={{ width: '100%', height: 20, position: 'relative' }}>
                <div style={{ position: 'absolute', left: labelPos, top: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                    <span className="text-xs bg-white px-2 py-0.5 rounded font-semibold border shadow-sm">
                        {String(textValue).replace(' ', '')}
                    </span>
                </div>
            </div>
        </div>
    )
}
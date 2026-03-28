import { useId } from 'react'

type Props = {
    GWidth?: number
    GHeight?: number
    value?: number
    toleranceMin?: number
    toleranceMax?: number
    textValue?: string
}

export default function VerticalLineGauge({
    GWidth = 16,
    GHeight = 160,
    value = 0,
    toleranceMin = 0,
    toleranceMax = 100,
    textValue = `${value} kg`
}: Props) {
    const uid = useId()

    const calcPos = () => {
        const percentMin = 37
        const percentMax = 63
        const range = toleranceMax - toleranceMin || 1
        const ratio = (value - toleranceMin) / range
        const posRaw = percentMax - ratio * (percentMax - percentMin)
        const posClamped = Math.max(0, Math.min(100, posRaw))
        return { pos: `${posClamped}%`, labelPos: `${posClamped}%` }
    }

    const { pos, labelPos } = calcPos()

    // Clamp label so it stays within the gauge bounds
    const labelTopPct = parseFloat(labelPos)
    const labelTopClamped = Math.max(5, Math.min(90, labelTopPct))

    return (
        <div className="flex items-center gap-3">
            <div style={{ position: 'relative', width: GWidth, height: GHeight }}>
                <svg width={GWidth} height={GHeight}>
                    <defs>
                        <linearGradient id={`vgrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%" spreadMethod="pad">
                            <stop offset="0%"   stopColor="#ef4444" stopOpacity="1" />
                            <stop offset="40%"  stopColor="#22c55e" stopOpacity="1" />
                            <stop offset="60%"  stopColor="#22c55e" stopOpacity="1" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    <rect x={0} y={0} width={GWidth} height={GHeight} fill={`url(#vgrad-${uid})`} rx={4} ry={4} />
                    <line
                        x1={0} x2={GWidth} y1={pos} y2={pos}
                        strokeWidth={2.5} stroke="white" strokeOpacity="0.9"
                    />
                </svg>
                <div style={{
                    position: 'absolute',
                    top: `${labelTopClamped}%`,
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                }}>
                    <span className="text-xs font-semibold bg-white px-2 py-0.5 rounded border shadow-sm">
                        {textValue.replace(' ', '')}
                    </span>
                </div>
            </div>
        </div>
    )
}

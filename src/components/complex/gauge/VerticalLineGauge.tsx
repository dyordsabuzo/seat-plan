import React, {useMemo} from 'react'

type Props = {
    GWidth?: number,
    GHeight?: number,
    value?: number,
    toleranceMin?: number,
    toleranceMax?: number,
    textValue?: string
}

export default function VerticalLineGauge({
                                                  GWidth = 12,
                                                  GHeight = 160,
                                                  value = 0,
                                                  toleranceMin = 0,
                                                  toleranceMax = 100,
                                                  textValue = `${value} kg`
                                              }: Props) {

    const id = useMemo(() => `vg-${Math.random().toString(36).slice(2,8)}`, [])

    const calcPos = () => {
        // Map value into a percent position on the vertical bar.
        // We want higher (positive) values to appear toward the top (smaller y),
        // and lower (negative) values toward the bottom (larger y).
        const percentMin = 37
        const percentMax = 63

        // handle degenerate tolerance range
        const range = toleranceMax - toleranceMin || 1

        // normalized ratio 0..1 for toleranceMin..toleranceMax
        const ratio = (value - toleranceMin) / range

        // invert mapping so larger values -> smaller percent (closer to percentMin)
        // we map ratio=0 -> percentMax (lower), ratio=1 -> percentMin (upper)
        const posRaw = percentMax - ratio * (percentMax - percentMin)

        const posClamped = Math.max(0, Math.min(100, posRaw))
        const labelPos = Math.max(0, Math.min(100, posClamped + 2))

        return { pos: `${posClamped}%`, labelPos: `${labelPos}%` }
    }

    const {pos, labelPos} = calcPos()

    return (
        <div className={`flex items-center gap-3`}>
            <svg width={GWidth} height={GHeight}>
                <defs>
                    <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%" spreadMethod="pad">
                        <stop offset="0%" stopColor="#ff2400" stopOpacity="1"></stop>
                        <stop offset="45%" stopColor="#33FF54" stopOpacity="1"></stop>
                        <stop offset="55%" stopColor="#33FF54" stopOpacity="1"></stop>
                        <stop offset="100%" stopColor="#ff2400" stopOpacity="1"></stop>
                    </linearGradient>
                </defs>

                <g>
                    <rect x={0} y={0} width={GWidth} height={GHeight} fill={`url(#grad-${id})`} rx={4} ry={4} />
                </g>

                <g>
                    <line x1={0}
                          x2={GWidth}
                          y1={pos}
                          y2={pos}
                          strokeWidth={3}
                          stroke="black" />
                </g>
            </svg>

            <div style={{height: GHeight, position: 'relative'}}>
                <div style={{position: 'absolute', top: labelPos, transform: 'translateY(-50%)'}}>
                    <span className={`text-sm`}>{textValue}</span>
                </div>
            </div>
        </div>
    )
}

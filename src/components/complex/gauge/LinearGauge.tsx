import {useEffect, useState} from "react";
import GaugeLabel from "./GaugeLabel";
import {text} from "stream/consumers";

export default function LinearGauge({
                                        GWidth = 100,
                                        GHeight = 300,
                                        width = 100,
                                        height = 100,
                                        value = 0,
                                        max = 100,
                                        toleranceMin = 45,
                                        toleranceMax = 55,
                                        min = 0,
                                        horizontal = false,
                                        textValue = ""
                                    }) {

    const [gaugeValue, setGaugeValue] = useState(0)

    useEffect(() => {
        // 40 and 60 are tolerance gauge values
        if (value >= toleranceMin) {
            if (value <= toleranceMax) {
                const basePoints = toleranceMax - toleranceMin
                const percentStep = 20 / basePoints
                const totalStepsToValue = Math.floor((value - toleranceMin) * percentStep)
                setGaugeValue(Math.min(40 + totalStepsToValue, 100))
            } else {
                const percentStep = 0.25
                const totalStepsToValue = Math.floor((value - toleranceMin) * percentStep)
                setGaugeValue(Math.min(60 + totalStepsToValue, 100))
            }
        } else {
            // if value is less than olerance minimum
            // calculate the position on the green bar
            if (value < toleranceMin * 2) {
                setGaugeValue(0)
            } else {
                setGaugeValue(40 - Math.ceil(Math.abs(value / toleranceMin)))
            }

        }
    }, [GHeight, max, toleranceMax, toleranceMin, value]);

    const calcPos = () => {
        return Math.max(30, (-gaugeValue + max) * GHeight / max);
    }

    return (
        <div className={`
                absolute 
                flex justify-center
                ${horizontal ? 'rotate-90 -top-28' : '-right-16 top-16'}
            `}>
            <svg width={GWidth} height={GHeight}>
                <defs>
                    <linearGradient
                        id="gradient" x1="0%" y1="0%" x2="0%" y2="100%" spreadMethod="pad">
                        <stop offset="0%" stopColor="#ff2400" stopOpacity="1"></stop>
                        <stop offset="45%" stopColor="#33FF54" stopOpacity="1"></stop>
                        <stop offset="55%" stopColor="#33FF54" stopOpacity="1"></stop>
                        <stop offset="100%" stopColor="#ff2400" stopOpacity="1"></stop>
                    </linearGradient>
                </defs>
                <g>
                    <rect x="0" y="30" width={width} height="100%" fill="url(#gradient)"></rect>
                </g>
                <g>
                    <line x1={width}
                          y1={calcPos()}
                          x2="0"
                          y2={calcPos()}
                          strokeWidth="3"
                          stroke="black"></line>
                </g>
                <g>
                    <circle cx={width / 20} cy={calcPos()} r="5"></circle>
                </g>
            </svg>
            <svg width={60} height={GHeight + 40}>
                <g>
                    <text
                        x={horizontal ? -(calcPos() + 20) : width / 20}
                        y={horizontal ? 5 * (width / 20) : calcPos() + 3}
                        transform={horizontal ? 'rotate(-90)' : ''}
                    >
                        <tspan className={`text-xs`}>
                            {textValue}
                        </tspan>
                    </text>
                </g>
            </svg>
        </div>
    )
}
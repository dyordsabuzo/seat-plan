import React from 'react'
import { useOptions } from '../../context/OptionsContext'

type Props = {
    optionKey: 'categories' | 'types' | 'distances' | 'boatTypes'
    value?: string | undefined
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

const OptionSelect: React.FC<Props> = ({ optionKey, value, onChange, placeholder, className }) => {
    const { options } = useOptions()
    const opts = options[optionKey] || []

    return (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={className}>
            <option value="">{placeholder ?? `Select ${optionKey}`}</option>
            {opts.map(o => (<option key={o} value={o}>{o}</option>))}
        </select>
    )
}

export default OptionSelect

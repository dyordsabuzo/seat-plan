import React, { useEffect, useState } from 'react'
import { Paddler } from '../../../types/RegattaType'
import OptionSelect from '../../basic/OptionSelect'

type Props = {
    onSave: (p: Omit<Paddler, 'id'>) => void
    onCancel: () => void
}

const AddPaddlerForm: React.FC<Props> = ({ onSave, onCancel }) => {
    const [name, setName] = useState<string>('')
    const [gender, setGender] = useState<string>('')
    const [weight, setWeight] = useState<number | undefined>(undefined)
    const [birthdate, setBirthdate] = useState<string>('')

    const handleSave = () => {
        if (!name || name.trim() === '') {
            alert('Name is required')
            return
        }
        if (weight === undefined || Number.isNaN(weight)) {
            alert('Weight is required')
            return
        }

        const created: Omit<Paddler, 'id'> = {
            name: name as string,
            gender,
            weight: Number(weight),
            birthdate
        }

        onSave(created)
        // close with animation
        requestClose()
    }

    const [mounted, setMounted] = useState(false)
    const [closing, setClosing] = useState(false)

    const requestClose = () => {
        if (typeof window !== 'undefined' && window.innerWidth >= 640) {
            onCancel()
            return
        }

        setClosing(true)
        setMounted(false)
    }

    useEffect(() => {
        // trigger enter animation after mount
        setMounted(true)
        return () => setMounted(false)
    }, [])

    return (
        <>
            <div className="fixed inset-0 bg-black/20 z-40 sm:hidden" onClick={requestClose} />

            <div
                className={`
                    z-50 fixed top-20 right-4 w-11/12 max-w-xs bg-white rounded shadow-lg border p-3 
                    sm:static sm:w-auto sm:max-w-none sm:shadow-none sm:border-none sm:p-0 
                    transform transition-transform duration-300 ease-out 
                    ${mounted ? 'translate-x-0' : 'translate-x-full'} sm:translate-x-0
                    text-sm
                `}
                onTransitionEnd={(e) => {
                    if (closing && e.propertyName === 'transform') {
                        onCancel()
                    }
                }}
            >
                {/* <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="text-sm font-medium">Add paddler</h3>
                    <button onClick={requestClose} aria-label="Close" className="text-gray-600 hover:text-black">✕</button>
                </div> */}
                <div className="flex items-center gap-2">
                    <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="px-2 py-1 border rounded w-36 sm:w-40" />
                    <OptionSelect optionKey="genders" value={gender} onChange={setGender} placeholder="gender" className="px-2 py-1 border rounded w-full" />

                    {/* <select value={gender} onChange={(e) => setGender(e.target.value)} className="px-2 py-1 border rounded w-20 sm:w-24">
                        <option value="M">M</option>
                        <option value="F">F</option>
                        <option value="O">Other</option>
                    </select> */}
                {/* </div>
                <div className="mt-2 flex items-center gap-2"> */}
                    <input placeholder="Weight (kg)" value={weight ?? ''} onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)} type="number" className="px-2 py-1 border rounded w-28 sm:w-24" />
                    <input placeholder="DOB" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} type="date" className="px-2 py-1 border rounded w-40 sm:w-36" />
                {/* </div>
                <div className="mt-3 flex justify-end gap-2"> */}
                    <button onClick={handleSave} className="px-2 py-1 bg-green-500 text-white rounded">Save</button>
                    <button onClick={requestClose} className="px-2 py-1 bg-gray-200 text-black rounded">Cancel</button>
                </div>
            </div>
        </>
    )
}

export default AddPaddlerForm

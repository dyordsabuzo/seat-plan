import React, { useEffect, useState } from 'react'
import { Race } from '../../../types/RegattaType'
import OptionSelect from '../../basic/OptionSelect'

type Props = {
    initial?: Partial<Race>
    onSave: (vals: { category: string, type: string, distance: string, boatType: string }) => void
    onCancel: () => void
}

const AddRaceForm: React.FC<Props> = ({ initial, onSave, onCancel }) => {
    // const { options } = useOptions()
    const [category, setCategory] = useState<string>(initial?.category ?? '')
    const [type, setType] = useState<string>(initial?.type ?? '')
    const [distance, setDistance] = useState<string>(initial?.distance ?? '')
    const [boatType, setBoatType] = useState<string>(initial?.boatType ?? '')

    const [mounted, setMounted] = useState(false)
    const [closing, setClosing] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    const requestClose = () => {
        // If on larger screens (Tailwind "sm" breakpoint and above), there's
        // no translate-x transition applied (sm:translate-x-0), so call onCancel
        // immediately. On small screens we run the exit animation.
        if (typeof window !== 'undefined' && window.innerWidth >= 640) {
            onCancel()
            return
        }

        setClosing(true)
        setMounted(false)
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-40 sm:hidden" onClick={requestClose} />

            <div
                role="dialog"
                aria-modal="true"
                className={`z-50 fixed top-24 right-4 w-11/12 max-w-xs bg-white rounded shadow-lg border p-3 sm:static sm:w-auto sm:max-w-none sm:shadow-none sm:border-none sm:p-0 transform transition-transform duration-300 ease-out ${mounted ? 'translate-x-0' : 'translate-x-full'} sm:translate-x-0`}
                onTransitionEnd={(e) => {
                    if (closing && e.propertyName === 'transform') {
                        onCancel()
                    }
                }}
            >
                {/* <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="text-sm font-medium">Add race</h3>
                    <button onClick={requestClose} aria-label="Close" className="text-gray-600 hover:text-black">✕</button>
                </div> */}
                <div className="p-3 flex flex-col sm:flex-row sm:gap-3 text-sm">
                    <OptionSelect optionKey="categories" value={category} onChange={setCategory} placeholder="category" className="px-2 py-1 border rounded w-full" />
                    <OptionSelect optionKey="types" value={type} onChange={setType} placeholder="type" className="px-2 py-1 border rounded w-full" />
                    <OptionSelect optionKey="distances" value={distance} onChange={setDistance} placeholder="distance" className="px-2 py-1 border rounded w-full" />
                    <OptionSelect optionKey="boatTypes" value={boatType} onChange={setBoatType} placeholder="boat type" className="px-2 py-1 border rounded w-full" />

                    <div className="flex gap-2 justify-end">
                        <button onClick={() => {
                            if (!category || !type || !distance || !boatType) {
                                alert('Please fill all race fields')
                                return
                            }
                            onSave({ category, type, distance, boatType })
                            requestClose()
                        }} className="px-3 py-1 bg-green-500 text-white rounded">Save</button>

                        <button onClick={requestClose} className="px-3 py-1 bg-gray-200 text-black rounded">Cancel</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddRaceForm

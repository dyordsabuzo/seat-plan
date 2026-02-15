import {useState} from "react";

type Props = {
    open: boolean,
    onClose: () => void,
    onAdd: (paddler: any) => void
}

const AddPaddlerModal: React.FC<Props> = ({open, onClose, onAdd}) => {
    const [name, setName] = useState("")
    const [gender, setGender] = useState("M")
    const [weight, setWeight] = useState("")
    const [dob, setDob] = useState("")

    if (!open) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            alert('Name is required')
            return
        }
        if (!weight || isNaN(Number(weight))) {
            alert('Weight is required and must be a number')
            return
        }

        const paddler = {
            id: `m-${new Date().getTime()}`,
            name: name.trim(),
            gender,
            weight: parseInt(weight),
            birthdate: dob || null
        }

        onAdd(paddler)
        // reset
        setName("")
        setGender("M")
        setWeight("")
        setDob("")
        onClose()
    }

    return (
        <>
            <div className={`justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50`}> 
                <div className={`relative w-full max-w-lg my-6 mx-auto`}> 
                    <div className={`border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white`}> 
                        <form onSubmit={handleSubmit} className={`p-6`}> 
                            <div className={`flex items-center justify-between mb-4`}> 
                                <h3 className={`text-xl font-semibold`}>Add paddler</h3>
                                <button type="button" onClick={onClose} className={`text-gray-500`}>✕</button>
                            </div>

                            <div className={`space-y-3`}> 
                                <div>
                                    <label className={`block text-sm font-medium`} >Name *</label>
                                    <input value={name} onChange={e => setName(e.target.value)} className={`mt-1 block w-full border rounded px-3 py-2`} />
                                </div>

                                <div className={`flex gap-3`}> 
                                    <div className={`flex-1`}> 
                                        <label className={`block text-sm font-medium`} >Gender *</label>
                                        <select value={gender} onChange={e => setGender(e.target.value)} className={`mt-1 block w-full border rounded px-3 py-2`}>
                                            <option value={`M`}>Male</option>
                                            <option value={`F`}>Female</option>
                                            <option value={`O`}>Other</option>
                                        </select>
                                    </div>
                                    <div className={`flex-1`}> 
                                        <label className={`block text-sm font-medium`} >Weight (kg) *</label>
                                        <input value={weight} onChange={e => setWeight(e.target.value)} className={`mt-1 block w-full border rounded px-3 py-2`} inputMode={`numeric`} />
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium`} >Date of birth (optional)</label>
                                    <input value={dob} onChange={e => setDob(e.target.value)} type={`date`} className={`mt-1 block w-full border rounded px-3 py-2`} />
                                </div>
                            </div>

                            <div className={`flex justify-end gap-3 mt-6`}> 
                                <button type={`button`} onClick={onClose} className={`px-3 py-2 text-sm rounded bg-gray-100`}>Cancel</button>
                                <button type={`submit`} className={`px-4 py-2 text-sm rounded bg-gradient-to-r from-cyan-500 to-blue-500 text-white`}>Add paddler</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className={`opacity-25 fixed inset-0 z-40 bg-black`}></div>
        </>
    )
}

export default AddPaddlerModal

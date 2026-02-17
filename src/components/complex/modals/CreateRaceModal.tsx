import {useState} from "react";

type Props = {
    open: boolean,
    onClose: () => void,
    onCreate: (name: string) => void
}

const CreateRaceModal: React.FC<Props> = ({open, onClose, onCreate}) => {
    const [name, setName] = useState("")

    if (!open) return null

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            alert('Name is required')
            return
        }
        onCreate(name.trim())
        setName("")
        onClose()
    }

    return (
        <>
            <div className={`justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50`}> 
                <div className={`relative w-full max-w-md my-6 mx-auto`}> 
                    <div className={`border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white`}> 
                        <form onSubmit={submit} className={`p-6`}> 
                            <div className={`flex items-center justify-between mb-4`}> 
                                <h3 className={`text-xl font-semibold`}>Create race configuration</h3>
                                <button type="button" onClick={onClose} className={`text-gray-500`}>✕</button>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium`}>Regatta name</label>
                                <input value={name} onChange={e => setName(e.target.value)} className={`mt-2 block w-full border rounded px-3 py-2`} />
                            </div>

                            <div className={`flex justify-end gap-3 mt-6`}> 
                                <button type={`button`} onClick={onClose} className={`px-3 py-2 text-sm rounded bg-gray-100`}>Cancel</button>
                                <button type={`submit`} className={`px-4 py-2 text-sm rounded bg-gradient-to-r from-cyan-500 to-blue-500 text-white`}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className={`opacity-25 fixed inset-0 z-40 bg-black`}></div>
        </>
    )
}

export default CreateRaceModal

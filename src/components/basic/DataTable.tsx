import React, {useState} from 'react'

type Option = { value: string; label: string }

export type Column<T> = {
    key: keyof T | string
    title: string
    editable?: boolean
    inputType?: 'text'|'number'|'select'|'date'
    options?: Option[]
    width?: string
    render?: (row: T) => React.ReactNode
}

type Props<T> = {
    columns: Column<T>[]
    data: T[]
    rowKey: keyof T | string,
    noEdit?: boolean,
    onSave?: (row: T) => void
    onDelete?: (rowKey: any) => void
    className?: string
}

export default function DataTable<T extends Record<string, any>>({columns, data, rowKey, noEdit = false, onSave, onDelete, className = ''}: Props<T>) {
    const [editingId, setEditingId] = useState<any>(null)
    const [draft, setDraft] = useState<Partial<T> | null>(null)

    const startEdit = (row: T) => {
        setEditingId(row[rowKey as string])
        setDraft({...row})
    }

    const cancelEdit = () => {
        setEditingId(null)
        setDraft(null)
    }

    const save = () => {
        if (!draft) return
        if (onSave) onSave(draft as T)
        setEditingId(null)
        setDraft(null)
    }

    return (
        <div className={`overflow-auto border rounded-lg ${className}`}>
            <table className={`min-w-full divide-y divide-gray-200`}> 
                <thead className={`bg-gray-50`}>
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className={`px-4 py-2 text-left text-xs font-medium text-gray-500`} style={{width: col.width}}>{col.title}</th>
                        ))}
                        <th className={`px-4 py-2 text-right text-xs font-medium text-gray-500`}>Actions</th>
                    </tr>
                </thead>
                <tbody className={`bg-white divide-y divide-gray-100`}>
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={columns.length + 1} className={`px-4 py-6 text-center text-sm text-gray-500`}>No items</td>
                        </tr>
                    )}

                    {data.map((row, rIdx) => {
                        const key = row[rowKey as string]
                        const isEditing = editingId === key
                        return (
                            <tr key={String(key) || rIdx}>
                                {columns.map((col, cIdx) => {
                                    const field = col.key as string
                                    const value = row[field]
                                    if (isEditing && col.editable) {
                                        // render input
                                        if (col.inputType === 'select' && col.options) {
                                            return (
                                                <td key={cIdx} className={`px-4 py-2 text-sm text-gray-700`}>
                                                    <select className={`border rounded p-1 text-sm w-full`} value={(draft as any)[field] ?? ''} onChange={e => setDraft({...draft, [field]: e.target.value})}>
                                                        {col.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                    </select>
                                                </td>
                                            )
                                        }

                                        const inputType = col.inputType === 'number' ? 'number' : col.inputType === 'date' ? 'date' : 'text'
                                        return (
                                            <td key={cIdx} className={`px-4 py-2 text-sm text-gray-700`}>
                                                <input className={`w-full border rounded p-1 text-sm`} value={(draft as any)[field] ?? ''} type={inputType} onChange={e => setDraft({...draft, [field]: e.target.value})} />
                                            </td>
                                        )
                                    }

                                    // not editing or non-editable
                                    if (col.render) return <td key={cIdx} className={`px-4 py-2 text-sm text-gray-700`}>{col.render(row)}</td>
                                    return <td key={cIdx} className={`px-4 py-2 text-sm text-gray-700`}>{value ?? ''}</td>
                                })}

                                <td className={`px-4 py-2 text-right`}>
                                    {isEditing ? (
                                        <div className={`flex gap-2 justify-end`}>
                                            <button onClick={save} className={`px-2 py-1 text-sm bg-green-500 text-white rounded`}>Save</button>
                                            <button onClick={cancelEdit} className={`px-2 py-1 text-sm bg-gray-200 rounded`}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div className={`flex gap-2 justify-end`}>
                                            {!noEdit && <button onClick={() => startEdit(row)} className={`px-2 py-1 text-sm bg-blue-500 text-white rounded`}>Edit</button>}
                                            <button onClick={() => onDelete && onDelete(key)} className={`px-2 py-1 text-sm bg-red-500 text-white rounded`}>Delete</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

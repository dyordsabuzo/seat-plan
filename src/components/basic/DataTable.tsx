import React, {useState} from 'react'

type Option = { value: string; label: string }

export type Column<T> = {
    key: keyof T | string
    title: string
    editable?: boolean
    inputType?: 'text'|'number'|'select'|'date'
    options?: Option[]
    width?: string
    sortable?: boolean
    filterable?: boolean
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
    const [sortBy, setSortBy] = useState<{key: string|null, direction: 'asc'|'desc'|null}>({key: null, direction: null})
    const [filters, setFilters] = useState<Record<string,string>>({})

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

    const toggleSort = (key: string, sortable?: boolean) => {
        if (!sortable) return
        setSortBy(prev => {
            if (prev.key !== key) return {key, direction: 'asc'}
            if (prev.direction === 'asc') return {key, direction: 'desc'}
            return {key: null, direction: null}
        })
    }

    const setFilterValue = (key: string, value: string) => {
        setFilters(prev => ({...prev, [key]: value}))
    }

    const processed = React.useMemo(() => {
        let rows = Array.isArray(data) ? [...data] : []

        // apply filters
        rows = rows.filter(r => {
            return Object.keys(filters).every(fk => {
                const val = (filters as any)[fk]
                if (!val && val !== 0) return true
                const cell = (r as any)[fk]
                if (cell === undefined || cell === null) return false
                // if column has options (select), we compare string
                const sCell = String(cell)
                return sCell.toLowerCase().includes(String(val).toLowerCase())
            })
        })

        // apply sorting
        if (sortBy.key && sortBy.direction) {
            const key = sortBy.key
            rows.sort((a,b) => {
                const va = (a as any)[key]
                const vb = (b as any)[key]
                if (va == null && vb == null) return 0
                if (va == null) return sortBy.direction === 'asc' ? -1 : 1
                if (vb == null) return sortBy.direction === 'asc' ? 1 : -1
                if (typeof va === 'number' && typeof vb === 'number') {
                    return sortBy.direction === 'asc' ? va - vb : vb - va
                }
                const sa = String(va)
                const sb = String(vb)
                return sortBy.direction === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa)
            })
        }

        return rows
    }, [data, filters, sortBy])

    return (
        <div className={`overflow-auto border rounded-lg ${className}`}>
            <table className={`min-w-full divide-y divide-gray-200`}> 
                <thead className={`bg-gray-50`}>
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className={`px-4 py-2 text-left text-xs font-medium text-gray-500 ${col.sortable ? 'cursor-pointer select-none' : ''}`} style={{width: col.width}} onClick={() => toggleSort(String(col.key), col.sortable)}>
                                <div className={`flex items-center gap-2`}>{col.title}
                                    {sortBy.key === String(col.key) && sortBy.direction === 'asc' && <span>▲</span>}
                                    {sortBy.key === String(col.key) && sortBy.direction === 'desc' && <span>▼</span>}
                                </div>
                            </th>
                        ))}
                        <th className={`px-4 py-2 text-right text-xs font-medium text-gray-500`}>Actions</th>
                    </tr>

                    {/* Filter row */}
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className={`px-2 py-1 text-left text-xs font-medium text-gray-500`}> 
                                {col.filterable ? (
                                    col.inputType === 'select' && col.options ? (
                                        <select className={`border rounded p-1 text-sm w-full`} value={filters[String(col.key)] ?? ''} onChange={e => setFilterValue(String(col.key), e.target.value)}>
                                            <option value="">(any)</option>
                                            {col.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    ) : (
                                        <input className={`w-full border rounded p-1 text-sm`} value={filters[String(col.key)] ?? ''} onChange={e => setFilterValue(String(col.key), e.target.value)} placeholder={`Filter ${col.title}`} />
                                    )
                                ) : null}
                            </th>
                        ))}
                        <th className={`px-4 py-2 text-right text-xs font-medium text-gray-500`}> </th>
                    </tr>
                </thead>
                <tbody className={`bg-white divide-y divide-gray-100`}>
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={columns.length + 1} className={`px-4 py-6 text-center text-sm text-gray-500`}>No items</td>
                        </tr>
                    )}

                    {processed.map((row, rIdx) => {
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

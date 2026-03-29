import React, { useState } from 'react';

type Option = { value: string; label: string }

export type Column<T> = {
    key: keyof T | string
    title: string
    editable?: boolean
    inputType?: 'text'|'number'|'select'|'date'
    options?: Option[]
    width?: string
    // when true, column will be frozen (sticky) on the left when horizontally scrolling
    frozen?: boolean
    sortable?: boolean
    filterable?: boolean
    // when true, the column is only shown while a row is in edit mode
    showOnEditOnly?: boolean
    // when true, the column is hidden while any row is being edited
    hideOnEdit?: boolean
    render?: (row: T) => React.ReactNode
}

type Props<T> = {
    columns: Column<T>[]
    data: T[]
    rowKey: keyof T | string,
    noEdit?: boolean,
    noDelete?: boolean,
    stickyHeader?: boolean,
    maxHeight?: string,
    onSave?: (row: T) => void
    onDelete?: (rowKey: any) => void
    className?: string
    // optional row selection (checkboxes)
    selectable?: boolean
    selected?: any[]
    onSelectionChange?: (selected: any[]) => void
}

export default function DataTable<T extends Record<string, any>>({columns, data, rowKey, noEdit = false, noDelete = false, stickyHeader = false, maxHeight = '', onSave, onDelete, className = '', selectable = false, selected: selectedProp, onSelectionChange}: Props<T>) {
    const [editingId, setEditingId] = useState<any>(null)
    const [draft, setDraft] = useState<Partial<T> | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [sortBy, setSortBy] = useState<{key: string|null, direction: 'asc'|'desc'|null}>({key: null, direction: null})
    const [filters, setFilters] = useState<Record<string,string>>({})
    const tableWrapperRef = React.useRef<HTMLDivElement | null>(null)
    const [frozenLefts, setFrozenLefts] = React.useState<Record<number, number>>({})
    const [internalSelected, setInternalSelected] = useState<any[]>([])
    const isControlledSelection = typeof selectedProp !== 'undefined'
    const selected = isControlledSelection ? (selectedProp as any[]) : internalSelected

    const setSelected = (next: any[]) => {
        if (onSelectionChange) onSelectionChange(next)
        if (!isControlledSelection) setInternalSelected(next)
    }

    // compute left offsets for frozen columns after render
    React.useLayoutEffect(() => {
        const wrapper = tableWrapperRef.current
        if (!wrapper) return
        const ths = wrapper.querySelectorAll('thead tr:first-child th')
        if (!ths || ths.length === 0) return
        const lefts: Record<number, number> = {}
        let acc = 0
        // account for optional selection column at the start
        const offset = selectable ? 1 : 0
        columns.forEach((col, idx) => {
            const th = ths[idx + offset] as HTMLElement | undefined
            const width = th ? Math.ceil(th.getBoundingClientRect().width) : 0
            if (col.frozen) {
                lefts[idx] = acc
                acc += width
            }
        })
        setFrozenLefts(lefts)
    // eslint-disable-next-line
    }, [columns, data])

    const startEdit = (row: T) => {
        setEditingId(row[rowKey as string])
        setDraft({...row})
    }

    const cancelEdit = () => {
        setEditingId(null)
        setDraft(null)
    }

    const getDisplayValue = (col: Column<T>, value: unknown) => {
        if (value === undefined || value === null || value === '') return ''
        if (col.inputType === 'select' && col.options) {
            const selectedOption = col.options.find(option => option.value === String(value))
            return selectedOption?.label ?? String(value)
        }
        return String(value)
    }

    const save = async () => {
        if (!draft) return
        try {
            setIsSaving(true)
            if (onSave) {
                await Promise.resolve(onSave(draft as T))
            }
            setEditingId(null)
            setDraft(null)
        } finally {
            setIsSaving(false)
        }
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
        <div ref={tableWrapperRef} className={`overflow-auto border rounded-lg ${maxHeight} ${className}`}>
            <table className={`min-w-full divide-y divide-gray-200`}> 
                <thead className={`bg-gray-50 ${stickyHeader ? 'sticky top-0 z-40' : ''}`}>
                    <tr>
                        {/* selection header cell */}
                        {selectable ? (
                            <th className={`px-4 py-2 text-left text-xs font-medium text-gray-500`}>
                                <input type="checkbox" ref={el => {
                                    if (!el) return
                                    const all = processed.length > 0 && processed.every(r => selected.includes(r[rowKey as string]))
                                    const some = processed.some(r => selected.includes(r[rowKey as string])) && !all
                                    el.checked = all
                                    el.indeterminate = some
                                }} onChange={e => {
                                    if (e.target.checked) {
                                        setSelected(processed.map(r => r[rowKey as string]))
                                    } else {
                                        setSelected([])
                                    }
                                }} />
                            </th>
                        ) : null}
                        {columns.map((col, idx) => (
                            <th key={idx}
                                className={`px-4 py-2 text-left text-xs font-medium text-gray-500 ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                                style={Object.assign({}, {width: col.width}, col.frozen ? { position: 'sticky' as const, left: frozenLefts[idx] ?? 0, zIndex: stickyHeader ? 50 : 30, background: '#f9fafb' } : {})}
                                onClick={() => toggleSort(String(col.key), col.sortable)}>
                                <div className={`flex items-center gap-2`}>{(col.showOnEditOnly && !editingId) || (col.hideOnEdit && editingId) ? '' : col.title}
                                    {sortBy.key === String(col.key) && sortBy.direction === 'asc' && <span>▲</span>}
                                    {sortBy.key === String(col.key) && sortBy.direction === 'desc' && <span>▼</span>}
                                </div>
                            </th>
                        ))}
                        <th className={`px-4 py-2 text-right text-xs font-medium text-gray-500`}>Actions</th>
                    </tr>

                    {/* Filter row */}
                    <tr>
                        {selectable ? (<th></th>) : null}
                        {columns.map((col, idx) => (
                            <th key={idx}
                                className={`px-2 py-1 text-left text-xs font-medium text-gray-500`}
                                style={col.frozen ? { position: 'sticky', left: frozenLefts[idx] ?? 0, zIndex: stickyHeader ? 45 : 25, background: '#f9fafb' } : {}}
                            > 
                                {((!col.showOnEditOnly || editingId) && !(col.hideOnEdit && editingId) && col.filterable) ? (
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
                            <td colSpan={columns.length + 1} className={`px-4 py-6 text-center text-xs text-gray-500`}>No items</td>
                        </tr>
                    )}

                    {processed.map((row, rIdx) => {
                        const key = row[rowKey as string]
                        const isEditing = editingId === key
                        return (
                            <tr key={String(key) || rIdx}>
                                {selectable ? (
                                    <td className={`px-4 py-2`}> 
                                        <input type="checkbox" checked={selected.includes(key)} onChange={e => {
                                            if (e.target.checked) setSelected([...selected, key])
                                            else setSelected(selected.filter(s => s !== key))
                                        }} />
                                    </td>
                                ) : null}
                                {columns.map((col, cIdx) => {
                                    // hide columns that are explicitly hidden while editing
                                    if (isEditing && col.hideOnEdit) {
                                        return <td key={cIdx} className={`px-4 py-2 text-xs text-gray-700`}></td>
                                    }
                                    // hide columns that are show-on-edit-only when not editing
                                    if (!isEditing && col.showOnEditOnly) {
                                        return <td key={cIdx} className={`px-4 py-2 text-xs text-gray-700`}></td>
                                    }
                                    const field = col.key as string
                                    const value = row[field]
                                    if (isEditing && col.editable) {
                                        // render input
                                        if (col.inputType === 'select' && col.options) {
                                            return (
                                                <td key={cIdx} className={`px-2 py-2 text-xs text-gray-700`} style={col.frozen ? { position: 'sticky', left: frozenLefts[cIdx] ?? 0, zIndex: 20, background: '#fff' } : {}}>
                                                    <select className={`border rounded p-1 text-xs w-full`} value={(draft as any)[field] ?? ''} onChange={e => setDraft({...draft, [field]: e.target.value})}>
                                                        <option value="">Select...</option>
                                                        {col.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                    </select>
                                                </td>
                                            )
                                        }

                                        const inputType = col.inputType === 'number' ? 'number' : col.inputType === 'date' ? 'date' : 'text'
                                        return (
                                            <td key={cIdx} className={`px-2 py-2 text-xs text-gray-700`} style={col.frozen ? { position: 'sticky', left: frozenLefts[cIdx] ?? 0, zIndex: 20, background: '#fff' } : {}}>
                                                <input className={`w-full border rounded p-1 text-xs`} value={(draft as any)[field] ?? ''} type={inputType} onChange={e => setDraft({...draft, [field]: e.target.value})} />
                                            </td>
                                        )
                                    }

                                    // not editing or non-editable
                                    if (col.render) return <td key={cIdx} className={`px-4 py-2 text-xs text-gray-700`} style={col.frozen ? { position: 'sticky', left: frozenLefts[cIdx] ?? 0, zIndex: 20, background: '#fff' } : {}}>{col.render(row)}</td>
                                    return <td key={cIdx} className={`px-4 py-2 text-xs text-gray-700`} style={col.frozen ? { position: 'sticky', left: frozenLefts[cIdx] ?? 0, zIndex: 20, background: '#fff' } : {}}>{getDisplayValue(col, value)}</td>
                                })}

                                <td className={`px-4 py-2 text-right`}>
                                    {isEditing ? (
                                        <div className={`flex gap-2 justify-end`}>
                                            <button onClick={save} disabled={isSaving} className={`px-2 py-1 text-xs bg-green-500 text-white rounded disabled:opacity-60 disabled:cursor-not-allowed`}>{isSaving ? 'Saving...' : 'Save'}</button>
                                            <button onClick={cancelEdit} disabled={isSaving} className={`px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-60 disabled:cursor-not-allowed`}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div className={`flex gap-2 justify-end`}>
                                            {!noEdit && <button onClick={() => startEdit(row)} className={`px-2 py-1 text-xs bg-blue-500 text-white rounded`}>Edit</button>}
                                            {!noDelete && <button onClick={() => onDelete && onDelete(key)} className={`px-2 py-1 text-xs bg-red-500 text-white rounded`}>Delete</button>}
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

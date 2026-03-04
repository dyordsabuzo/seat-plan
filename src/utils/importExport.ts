import { Paddler } from '../types/RegattaType'

export function exportPaddlersJSON(paddlers: Paddler[]) {
  const json = JSON.stringify(paddlers, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  return blob
}

export function exportPaddlersCSV(paddlers: Paddler[], filename = 'export.csv') {
  const headers = ['id', 'name', 'gender', 'weight', 'birthdate', 'preferredSide']
  const csv = [headers.join(',')].concat(paddlers.map(r => headers.map(h => {
    const v = (r as any)[h]
    if (v === null || v === undefined) return ''
    const s = String(v).replace(/"/g, '""')
    return /[",\n]/.test(s) ? `"${s}"` : s
  }).join(','))).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  return blob
}

// Normalize parsed JSON/CSV rows to Paddler shape (partial allowed)
export function normalizePaddlers(rows: any[]): Paddler[] {
  return rows.map((p: any, idx: number) => ({
    id: p.id ? String(p.id) : undefined,
    name: p.name || '',
    gender: p.gender || '',
    weight: p.weight ? Number(p.weight) : undefined,
    birthdate: p.birthdate || '',
    preferredSide: p.preferredSide || '',
  }))
}

// Very small CSV parser used by the import flow — keeps behavior consistent with prior implementation
export function parseCSVText(text: string) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length)
  if (lines.length === 0) return []
  const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map(line => {
    const values: string[] = []
    let cur = ''
    let inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') { inQuote = !inQuote; continue }
      if (ch === ',' && !inQuote) { values.push(cur); cur = ''; continue }
      cur += ch
    }
    values.push(cur)
    const obj: any = {}
    header.forEach((h, idx) => {
      obj[h] = values[idx] ? values[idx].replace(/^"|"$/g, '').trim() : ''
    })
    return obj
  })
  return rows
}

import { normalizePaddlers, parseCSVText } from '../utils/importExport'

describe('importExport utilities', () => {
  it('parses simple csv text', () => {
    const csv = `id,name,gender\n1,Alex,M\n2,"Sam, Jr",F`
    const rows = parseCSVText(csv)
    expect(rows.length).toBe(2)
    expect(rows[1].name).toBe('Sam, Jr')
  })

  it('normalizes paddlers', () => {
    const rows = [{ id: 1, name: 'Alex', weight: '70' }, { name: 'Sam' }]
    const normalized = normalizePaddlers(rows as any)
    expect(normalized[0].id).toBe('1')
    expect(normalized[0].weight).toBe(70)
    expect(normalized[1].id).toBeUndefined()
  })
})

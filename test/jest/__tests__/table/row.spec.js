import TableInfo from 'src/lib/table/TableInfo'
import { FlatRow } from 'src/lib/table/row'

import INFO_MOCK from './tableinfo.mock.js'


describe('Row merging while being edited', () => {
  const info = new TableInfo(INFO_MOCK, {})
  const fakeTable = { info, rows: [] }
  const row = new FlatRow(
      fakeTable,
      { a: 'a', b: 'b', c: 'c', d: 'd' }
  )

  const fieldA = info.fields.find(field => field.name === 'a')
  const fieldB = info.fields.find(field => field.name === 'b')
  const fieldC = info.fields.find(field => field.name === 'c')
  const fieldD = info.fields.find(field => field.name === 'd')

  it('has fields', () => {
    expect(fieldA).toBeDefined()
    expect(fieldB).toBeDefined()
    expect(fieldC).toBeDefined()
    expect(fieldD).toBeDefined()
  })

  it('has data', () => {
    expect(fieldA.getValue({ row })).toBe('a')
    expect(fieldB.getValue({ row })).toBe('b')
    expect(fieldC.getValue({ row })).toBe('c')
    expect(fieldD.getValue({ row })).toBe('d')
  })

  it('can be edited', () => {
    row.edit({ b: 'edited b' })
    expect(fieldB.getValue({ row })).toBe('edited b')
    expect(row.status.edited).toBe(true)
  })

  it('can be consolidated', () => {
    row.consolidateChanges()
    expect(fieldB.getValue({ row })).toBe('edited b')
    row.resetStatus()
    expect(row.status.edited).toBe(false)
  })

  it('can be edited again', () => {
    row.edit({ c: 'edited c' })
    expect(fieldB.getValue({ row })).toBe('edited b')
    expect(row.status.edited).toBe(true)
  })

  it('can be merged while being edited', () => {
    const newRow = new FlatRow(
        fakeTable,
        { a: 'a', b: 'external b', c: 'external c', d: 'external d' }
    )

    const result = row.merge(newRow)

    expect(fieldA.getValue({ row: result })).toBe('a')
    expect(fieldB.getValue({ row: result })).toBe('edited b')
    expect(fieldC.getValue({ row: result })).toBe('edited c')
    expect(fieldD.getValue({ row: result })).toBe('external d')
  })
})

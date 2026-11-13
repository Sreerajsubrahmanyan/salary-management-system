import { describe, expect, it } from 'vitest'
import type { PayReportPayload } from '../api/types'
import { buildPayReportCsv } from './payReportCsv'

describe('buildPayReportCsv', () => {
  it('exports filtered report rows with currency and date context', () => {
    const report: PayReportPayload = {
      data: [{
        group_value: 'Engineering, East', currency: 'USD', employee_count: 4,
        total_salary: '320000', average_salary: '80000', median_salary: '78000',
        minimum_salary: '60000', maximum_salary: '100000',
      }],
      meta: { group_by: 'department', as_of: '2026-11-13', group_count: 1 },
    }

    const csv = buildPayReportCsv(report, { group_by: 'department', country: 'US', status: 'active' })

    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('"grouping","group","currency"')
    expect(csv).toContain('"department","Engineering, East","USD","4","2026-11-13","US","active"')
    expect(csv).toContain('"320000","80000","78000","60000","100000"')
  })

  it('quotes cells and neutralizes spreadsheet formulas in group names', () => {
    const report: PayReportPayload = {
      data: [{
        group_value: '=IMPORTDATA("https://example.test")', currency: 'USD', employee_count: 1,
        total_salary: '10', average_salary: '10', median_salary: '10', minimum_salary: '10', maximum_salary: '10',
      }],
      meta: { group_by: 'department', as_of: '2026-11-13', group_count: 1 },
    }

    const csv = buildPayReportCsv(report, {})

    expect(csv).toContain("\"'=IMPORTDATA(\"\"https://example.test\"\")\"")
  })
})

import type { PayReportFilters, PayReportPayload } from '../api/types'

function csvCell(value: string | number) {
  const text = String(value)
  const safeText = /^[\t\r ]*[=+@-]/.test(text) ? `'${text}` : text
  return `"${safeText.replaceAll('"', '""')}"`
}

export function buildPayReportCsv(report: PayReportPayload, filters: PayReportFilters) {
  const headers = [
    'grouping', 'group', 'currency', 'employee_count', 'as_of', 'country_filter', 'status_filter',
    'total_salary', 'average_salary', 'median_salary', 'minimum_salary', 'maximum_salary',
  ]
  const rows = report.data.map((row) => [
    report.meta.group_by,
    row.group_value,
    row.currency,
    row.employee_count,
    report.meta.as_of,
    filters.country ?? 'all',
    filters.status ?? 'all',
    row.total_salary,
    row.average_salary,
    row.median_salary,
    row.minimum_salary,
    row.maximum_salary,
  ])

  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`
}

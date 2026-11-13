import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { SalaryRecord } from '../api/types'
import { SalaryHistoryChart } from './SalaryHistoryChart'

const history: SalaryRecord[] = [
  { id: 2, amount: '84000.0000', currency: 'USD', effective_date: '2025-01-01', end_date: null },
  { id: 1, amount: '72000.0000', currency: 'USD', effective_date: '2024-01-01', end_date: '2024-12-31' },
]

describe('SalaryHistoryChart', () => {
  it('plots dated salary changes in chronological order', () => {
    const { container } = render(<SalaryHistoryChart records={history} employeeName="Ada Lovelace" />)

    expect(screen.getByRole('img', { name: 'Ada Lovelace salary history in USD' })).toBeTruthy()
    expect(container.querySelectorAll('.salary-chart-point')).toHaveLength(2)
    expect(container.querySelector('.salary-chart-line')).toBeTruthy()
    expect(screen.getByText('2 dated entries')).toBeTruthy()
  })

  it('separates currencies and breaks the salary line when currency changes', () => {
    const mixedHistory: SalaryRecord[] = [
      history[0],
      { id: 3, amount: '6200000', currency: 'INR', effective_date: '2026-01-01', end_date: null },
    ]
    const { container } = render(<SalaryHistoryChart records={mixedHistory} employeeName="Ada Lovelace" />)

    expect(screen.getByRole('img', { name: 'Ada Lovelace salary history in USD' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Ada Lovelace salary history in INR' })).toBeTruthy()
    expect(container.querySelectorAll('.salary-chart-line')).toHaveLength(0)
  })

  it('does not render a chart without salary history', () => {
    const { container } = render(<SalaryHistoryChart records={[]} employeeName="Ada Lovelace" />)

    expect(container.firstChild).toBeNull()
  })
})

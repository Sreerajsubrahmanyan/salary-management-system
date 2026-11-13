import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { getPayReport } from '../api/client'
import { PayIntelligence } from './PayIntelligence'

vi.mock('../api/client', () => ({ getPayReport: vi.fn() }))

describe('PayIntelligence', () => {
  it('shows grouped payroll data and reloads when grouping changes', async () => {
    vi.mocked(getPayReport).mockResolvedValue({
      data: [{ group_value: 'Engineering', currency: 'USD', employee_count: 42, total_salary: '3500000.0000', average_salary: '83333.3333', minimum_salary: '60000', median_salary: '80000', maximum_salary: '150000' }],
      meta: { group_by: 'department', as_of: '2026-01-01', group_count: 1 },
    })

    render(<PayIntelligence />)
    expect((await screen.findAllByText('Engineering')).length).toBeGreaterThan(0)
    expect(screen.getByText('Where people sit')).toBeTruthy()
    expect(screen.getByText('Median by group')).toBeTruthy()
    expect(screen.getAllByText('USD 3,500,000')).toHaveLength(2)
    expect(screen.getAllByText('42')).toHaveLength(3)
    expect(screen.getByText(/Median USD 80,000/)).toBeTruthy()
    expect(screen.getByText(/range USD 60,000 — USD 150,000/)).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Read the ledger by'), { target: { value: 'job_title' } })
    await waitFor(() => expect(getPayReport).toHaveBeenLastCalledWith(expect.objectContaining({ group_by: 'job_title' })))

    fireEvent.change(screen.getByLabelText('Employment status'), { target: { value: 'active' } })
    await waitFor(() => expect(getPayReport).toHaveBeenLastCalledWith(expect.objectContaining({ group_by: 'job_title', status: 'active' })))
  })
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { getPayReport } from '../api/client'
import { PayIntelligence } from './PayIntelligence'

vi.mock('../api/client', () => ({ getPayReport: vi.fn() }))

describe('PayIntelligence', () => {
  it('shows grouped payroll data and reloads when grouping changes', async () => {
    vi.mocked(getPayReport).mockResolvedValue({
      data: [{ group_value: 'Engineering', currency: 'USD', employee_count: 42, total_salary: '3500000.0000', average_salary: '83333.3333' }],
      meta: { group_by: 'department', as_of: '2026-01-01', group_count: 1 },
    })

    render(<PayIntelligence />)
    expect(await screen.findByText('Engineering')).toBeTruthy()
    expect(screen.getAllByText('USD 3,500,000')).toHaveLength(2)
    expect(screen.getAllByText('42')).toHaveLength(2)

    fireEvent.change(screen.getByLabelText('Read the ledger by'), { target: { value: 'country' } })
    await waitFor(() => expect(getPayReport).toHaveBeenLastCalledWith(expect.objectContaining({ group_by: 'country' })))
  })
})

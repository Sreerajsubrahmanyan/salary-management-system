import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEmployee, getEmployee, listEmployees } from '../api/client'
import type { Employee, EmployeeDirectoryPayload } from '../api/types'
import { EmployeeWorkspace } from './EmployeeWorkspace'

vi.mock('../api/client', () => ({
  createEmployee: vi.fn(),
  getEmployee: vi.fn(),
  listEmployees: vi.fn(),
  updateEmployee: vi.fn(),
}))

const ada: Employee = {
  employee_number: 'DEMO-00001',
  first_name: 'Ada',
  last_name: 'Lovelace',
  email: 'employee.00001@example.test',
  country_code: 'US',
  department: 'Engineering',
  job_title: 'Engineer',
  status: 'active',
  hire_date: '2020-01-15',
  current_salary: { id: 1, amount: '72000.0000', currency: 'USD', effective_date: '2024-01-01', end_date: null },
}

const directory: EmployeeDirectoryPayload = {
  data: [ada],
  meta: { page: 1, per_page: 25, total_count: 10_000, total_pages: 400 },
}

describe('EmployeeWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(listEmployees).mockResolvedValue(directory)
  })

  it('shows real directory fields and applies a server-side search', async () => {
    render(<EmployeeWorkspace />)

    expect(await screen.findByRole('button', { name: /Ada Lovelace/ })).toBeTruthy()
    expect(screen.getByText('72,000.0')).toBeTruthy()
    expect(screen.getByText('10,000')).toBeTruthy()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search people' }), { target: { value: 'Ada' } })
    await waitFor(() => {
      expect(listEmployees).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'Ada' }))
    })
  })

  it('opens an employee profile with the dated salary ledger', async () => {
    vi.mocked(getEmployee).mockResolvedValue({
      data: { ...ada, salary_records: [ada.current_salary!] },
    })
    render(<EmployeeWorkspace />)
    fireEvent.click(await screen.findByRole('button', { name: /Ada Lovelace/ }))

    expect(await screen.findByRole('heading', { name: /Ada/ })).toBeTruthy()
    expect(screen.getByText('Salary history')).toBeTruthy()
    expect(screen.getByText('Jan 1, 2024')).toBeTruthy()
  })

  it('creates a new employee and returns to the refreshed register', async () => {
    vi.mocked(createEmployee).mockResolvedValue({ data: ada })
    render(<EmployeeWorkspace />)
    fireEvent.click(await screen.findByRole('button', { name: 'Add a person' }))

    fireEvent.change(screen.getByLabelText('Employee number'), { target: { value: 'NEW-1001' } })
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Grace' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Hopper' } })
    fireEvent.change(screen.getByLabelText('Country code'), { target: { value: 'gb' } })
    fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'Engineering' } })
    fireEvent.change(screen.getByLabelText('Job title'), { target: { value: 'Compiler Engineer' } })
    fireEvent.click(screen.getByRole('button', { name: /add to register/i }))

    await waitFor(() => expect(createEmployee).toHaveBeenCalledWith(expect.objectContaining({
      employee_number: 'NEW-1001',
      first_name: 'Grace',
      last_name: 'Hopper',
      country_code: 'GB',
    })))
    await waitFor(() => expect(listEmployees).toHaveBeenCalledTimes(2))
    expect(await screen.findByRole('button', { name: /Ada Lovelace/ })).toBeTruthy()
  })
})

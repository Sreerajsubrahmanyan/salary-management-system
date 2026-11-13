import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError, createEmployee, createSalaryRecord, getEmployee, listEmployees, updateEmployee } from '../api/client'
import type { Employee, EmployeeFilters, EmployeeInput, SalaryRecord, SalaryRecordInput } from '../api/types'
import { SalaryHistoryChart } from './SalaryHistoryChart'
import './EmployeeWorkspace.css'

type ViewState =
  | { type: 'directory' }
  | { type: 'profile'; employeeNumber: string }
  | { type: 'form'; employee: Employee | null }

type FormValues = {
  employee_number: string
  first_name: string
  last_name: string
  email: string
  country_code: string
  department: string
  job_title: string
  status: Employee['status']
  hire_date: string
}

const blankForm: FormValues = {
  employee_number: '',
  first_name: '',
  last_name: '',
  email: '',
  country_code: '',
  department: '',
  job_title: '',
  status: 'active',
  hire_date: '',
}

export function EmployeeWorkspace() {
  const [view, setView] = useState<ViewState>({ type: 'directory' })
  const [refreshKey, setRefreshKey] = useState(0)

  if (view.type === 'profile') {
    return (
      <EmployeeProfile
        key={refreshKey}
        employeeNumber={view.employeeNumber}
        onBack={() => setView({ type: 'directory' })}
        onEdit={(employee) => setView({ type: 'form', employee })}
        onSalarySaved={() => setRefreshKey((key) => key + 1)}
      />
    )
  }

  if (view.type === 'form') {
    return (
      <EmployeeForm
        employee={view.employee}
        onCancel={() => setView(view.employee ? { type: 'profile', employeeNumber: view.employee.employee_number } : { type: 'directory' })}
        onSaved={(employeeNumber) => {
          setView(employeeNumber ? { type: 'profile', employeeNumber } : { type: 'directory' })
          setRefreshKey((key) => key + 1)
        }}
      />
    )
  }

  return (
    <EmployeeDirectory
      key={refreshKey}
      onOpen={(employeeNumber) => setView({ type: 'profile', employeeNumber })}
      onAdd={() => setView({ type: 'form', employee: null })}
    />
  )
}

type DirectoryProps = {
  onOpen: (employeeNumber: string) => void
  onAdd: () => void
}

function EmployeeDirectory({ onOpen, onAdd }: DirectoryProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [page, setPage] = useState(1)
  const [queryInput, setQueryInput] = useState('')
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [meta, setMeta] = useState({ page: 1, per_page: 25, total_count: 0, total_pages: 0 })
  const [loadedRequest, setLoadedRequest] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<{ request: string; message: string } | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const requestKey = JSON.stringify({ query, country, department, status, page, retryKey })
  const isLoading = loadedRequest !== requestKey
  const error = loadError?.request === requestKey ? loadError.message : null

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setQuery(queryInput.trim())
      setPage(1)
    }, 220)
    return () => window.clearTimeout(timeout)
  }, [queryInput])

  useEffect(() => {
    let active = true
    const filters: EmployeeFilters = {
      q: query || undefined,
      country: country || undefined,
      department: department || undefined,
      status: status || undefined,
      page,
      per_page: 25,
    }

    listEmployees(filters)
      .then((payload) => {
        if (!active) return
        setEmployees(payload.data)
        setMeta(payload.meta)
        setLoadError(null)
        setLoadedRequest(requestKey)
      })
      .catch((caughtError: unknown) => {
        if (!active) return
        setLoadError({
          request: requestKey,
          message: caughtError instanceof Error ? caughtError.message : 'The employee register could not be loaded.',
        })
        setLoadedRequest(requestKey)
      })

    return () => {
      active = false
    }
  }, [query, country, department, status, page, retryKey, requestKey])

  function clearFilters() {
    setQueryInput('')
    setQuery('')
    setCountry('')
    setDepartment('')
    setStatus('')
    setPage(1)
  }

  const hasFilters = Boolean(queryInput || country || department || status)

  return (
    <section className="employee-directory" aria-labelledby="directory-title">
      <div className="directory-heading-row">
        <div>
          <p className="workspace-kicker">The people register <span className="directory-slash">/</span> 01</p>
          <h1 className="directory-title" id="directory-title">People, in<br /><em>good order.</em></h1>
          <p className="directory-deck">A clear record of every colleague, across teams and countries.</p>
        </div>
        <button className="add-person-button" type="button" onClick={onAdd}>
          <span aria-hidden="true">＋</span> Add a person
        </button>
      </div>

      <div className="directory-summary" aria-live="polite">
        <span className="summary-index">01</span>
        <span className="summary-label">People in the register</span>
        <strong>{isLoading && meta.total_count === 0 ? '—' : meta.total_count.toLocaleString()}</strong>
        <span className="summary-rule" />
        <span className="summary-context">Search by name, email, or employee number</span>
      </div>

      <div className="directory-controls">
        <label className="search-control">
          <span className="sr-only">Search people</span>
          <span className="search-glyph" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={queryInput}
            placeholder="Find a person or employee number"
            onChange={(event) => setQueryInput(event.target.value)}
          />
          {queryInput && <button type="button" onClick={() => setQueryInput('')} aria-label="Clear search">×</button>}
        </label>

        <label className="filter-control country-filter">
          <span>Country</span>
          <input
            value={country}
            maxLength={2}
            placeholder="All"
            onChange={(event) => { setCountry(event.target.value.toUpperCase()); setPage(1) }}
            aria-label="Filter by country code"
          />
        </label>

        <label className="filter-control department-filter">
          <span>Department</span>
          <input
            value={department}
            placeholder="All teams"
            onChange={(event) => { setDepartment(event.target.value); setPage(1) }}
            aria-label="Filter by department"
          />
        </label>

        <label className="filter-control status-filter">
          <span>Status</span>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} aria-label="Filter by status">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="on_leave">On leave</option>
            <option value="terminated">Former</option>
          </select>
        </label>

        {hasFilters && <button className="clear-filters" type="button" onClick={clearFilters}>Clear filters</button>}
      </div>

      <div className="register-caption">
        <span><i className="register-status-dot" /> Directory index</span>
        <span>{isLoading ? 'Reading the register…' : `Showing ${employees.length ? ((page - 1) * meta.per_page) + 1 : 0}–${Math.min(page * meta.per_page, meta.total_count)} of ${meta.total_count.toLocaleString()}`}</span>
      </div>

      {error ? (
        <div className="directory-message" role="alert">
          <span className="message-index">!</span>
          <div><strong>The register is unavailable.</strong><p>{error}</p></div>
          <button type="button" onClick={() => setRetryKey((key) => key + 1)}>Try again <span aria-hidden="true">↗</span></button>
        </div>
      ) : isLoading && employees.length === 0 ? (
        <div className="directory-loading" role="status"><span className="loading-stroke" /><span>Turning the pages…</span></div>
      ) : employees.length === 0 ? (
        <div className="directory-empty">
          <p className="empty-overline">No matching records</p>
          <h2>{hasFilters ? 'Try another search.' : 'The register is ready for its first person.'}</h2>
          <p>{hasFilters ? 'Adjust or clear the filters to widen your search.' : 'Add an employee profile to start building a considered record.'}</p>
          {hasFilters ? <button type="button" onClick={clearFilters}>Clear filters</button> : <button type="button" onClick={onAdd}>Add a person <span aria-hidden="true">↗</span></button>}
        </div>
      ) : (
        <>
          <div className={`employee-table-wrap${isLoading ? ' is-refreshing' : ''}`}>
            <table className="employee-table">
              <thead>
                <tr>
                  <th scope="col">Person <span>· employee ref.</span></th>
                  <th scope="col">Team / role</th>
                  <th scope="col">Place</th>
                  <th scope="col">Current pay</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => (
                  <tr key={employee.employee_number} style={{ animationDelay: `${Math.min(index * 18, 180)}ms` }}>
                    <td>
                      <button className="person-link" type="button" onClick={() => onOpen(employee.employee_number)}>
                        <span className="person-name">{employee.first_name} {employee.last_name}</span>
                        <span className="person-reference">{employee.employee_number}</span>
                      </button>
                    </td>
                    <td><span className="team-name">{employee.department}</span><span className="role-name">{employee.job_title}</span></td>
                    <td><span className="country-code">{employee.country_code}</span></td>
                    <td><SalaryValue record={employee.current_salary} /></td>
                    <td><StatusTag status={employee.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="directory-pagination">
            <span className="pagination-note">Register / page {page.toString().padStart(2, '0')}</span>
            <div className="pagination-actions">
              <span>Page {page} of {Math.max(meta.total_pages, 1)}</span>
              <button type="button" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => current - 1)} aria-label="Previous page">←</button>
              <button type="button" disabled={page >= meta.total_pages || isLoading} onClick={() => setPage((current) => current + 1)} aria-label="Next page">→</button>
            </div>
          </footer>
        </>
      )}
    </section>
  )
}

type ProfileProps = {
  employeeNumber: string
  onBack: () => void
  onEdit: (employee: Employee) => void
  onSalarySaved: () => void
}

function EmployeeProfile({ employeeNumber, onBack, onEdit, onSalarySaved }: ProfileProps) {
  const [addingSalary, setAddingSalary] = useState(false)
  const [loadedRecord, setLoadedRecord] = useState<{ employeeNumber: string; employee: Employee } | null>(null)
  const [loadFailure, setLoadFailure] = useState<{ employeeNumber: string; message: string } | null>(null)
  const employee = loadedRecord?.employeeNumber === employeeNumber ? loadedRecord.employee : null
  const error = loadFailure?.employeeNumber === employeeNumber ? loadFailure.message : null
  const isLoading = !employee && !error

  useEffect(() => {
    let active = true
    getEmployee(employeeNumber)
      .then(({ data }) => {
        if (!active) return
        setLoadedRecord({ employeeNumber, employee: data })
        setLoadFailure(null)
      })
      .catch((caughtError: unknown) => {
        if (active) setLoadFailure({
          employeeNumber,
          message: caughtError instanceof Error ? caughtError.message : 'Employee record unavailable.',
        })
      })

    return () => { active = false }
  }, [employeeNumber])

  if (isLoading) return <div className="profile-loading" role="status">Retrieving the employee record…</div>
  if (error || !employee) {
    return <div className="directory-message profile-error" role="alert"><span className="message-index">!</span><div><strong>Record unavailable.</strong><p>{error ?? 'This employee could not be found.'}</p></div><button type="button" onClick={onBack}>Back to register</button></div>
  }

  const records = employee.salary_records ?? []

  return (
    <section className="employee-profile" aria-labelledby="profile-title">
      <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to people register</button>
      <div className="profile-heading-row">
        <div>
          <p className="workspace-kicker">Employee record <span className="directory-slash">/</span> {employee.employee_number}</p>
          <h1 className="profile-title" id="profile-title">{employee.first_name}<br /><em>{employee.last_name}.</em></h1>
          <p className="profile-email">{employee.email || 'No email recorded'}</p>
        </div>
        <div className="profile-actions">
          <StatusTag status={employee.status} />
          {employee.status === 'terminated' ? (
            <span className="salary-change-unavailable">New salary entries are closed for former employees.</span>
          ) : (
            <button className="salary-change-button" type="button" onClick={() => setAddingSalary((visible) => !visible)}>
              {addingSalary ? 'Close salary form' : employee.current_salary ? 'Record salary change' : 'Set first salary'}
            </button>
          )}
          <button className="edit-person-button" type="button" onClick={() => onEdit(employee)}>Edit record <span aria-hidden="true">↗</span></button>
        </div>
      </div>

      {addingSalary && <SalaryChangeForm employee={employee} onCancel={() => setAddingSalary(false)} onSaved={onSalarySaved} />}

      <div className="profile-facts">
        <div><span>Employee number</span><strong>{employee.employee_number}</strong></div>
        <div><span>Department</span><strong>{employee.department}</strong></div>
        <div><span>Position</span><strong>{employee.job_title}</strong></div>
        <div><span>Country</span><strong>{employee.country_code}</strong></div>
        <div><span>Joined</span><strong>{formatDate(employee.hire_date)}</strong></div>
        <div className="fact-pay"><span>Current salary</span><strong><SalaryValue record={employee.current_salary} /></strong></div>
      </div>

      <SalaryHistoryChart records={records} employeeName={`${employee.first_name} ${employee.last_name}`} />

      <div className="history-heading">
        <div><p className="workspace-kicker">01 <span className="directory-slash">/</span> Change log</p><h2>Salary history</h2></div>
        <span>{records.length} {records.length === 1 ? 'record' : 'records'}</span>
      </div>

      {records.length === 0 ? (
        <div className="history-empty">No salary changes have been recorded for this person.</div>
      ) : (
        <div className="history-table-wrap">
          <table className="history-table">
            <thead><tr><th scope="col">Effective</th><th scope="col">Compensation</th><th scope="col">Currency</th><th scope="col">Through</th></tr></thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{formatDate(record.effective_date)}</td>
                  <td className="history-amount">{formatAmount(record.amount)}</td>
                  <td>{record.currency}</td>
                  <td>{record.end_date ? formatDate(record.end_date) : 'Current'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

type SalaryChangeFormProps = {
  employee: Employee
  onCancel: () => void
  onSaved: () => void
}

function SalaryChangeForm({ employee, onCancel, onSaved }: SalaryChangeFormProps) {
  const nextOpenRecord = employee.salary_records?.find((record) => record.end_date === null)
  const minimumDate = nextOpenRecord ? dateAfter(nextOpenRecord.effective_date) : localToday()
  const [values, setValues] = useState<SalaryRecordInput>(() => ({
    amount: '',
    currency: employee.current_salary?.currency ?? nextOpenRecord?.currency ?? '',
    effective_date: minimumDate > localToday() ? minimumDate : localToday(),
  }))
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function update<K extends keyof SalaryRecordInput>(key: K, value: SalaryRecordInput[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: [] }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})
    setMessage('')
    setIsSaving(true)
    try {
      await createSalaryRecord(employee.employee_number, {
        ...values,
        amount: values.amount.trim(),
        currency: values.currency.trim().toUpperCase(),
      })
      onSaved()
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.errors) setErrors(caughtError.errors)
      setMessage(caughtError instanceof Error ? caughtError.message : 'The salary record could not be saved.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="salary-change-form" onSubmit={handleSubmit} aria-labelledby="salary-change-title">
      <div className="salary-change-intro">
        <p className="workspace-kicker">Compensation update <span className="directory-slash">/</span> New entry</p>
        <h2 id="salary-change-title">Record a salary change.</h2>
        <p>The previous open record will end the day before this effective date. Existing history stays intact.</p>
      </div>
      {message && <p className="form-notice salary-form-error" role="alert">{message}</p>}
      <div className="salary-change-fields">
        <FormField label="Annual salary amount" error={errors.amount?.[0]}>
          <input value={values.amount} onChange={(event) => update('amount', event.target.value)} inputMode="decimal" placeholder="e.g. 72000.00" required />
        </FormField>
        <FormField label="Currency code" error={errors.currency?.[0]}>
          <input value={values.currency} onChange={(event) => update('currency', event.target.value.toUpperCase())} maxLength={3} placeholder="USD" required />
        </FormField>
        <FormField label="Effective date" error={errors.effective_date?.[0]}>
          <input type="date" value={values.effective_date} min={minimumDate} onChange={(event) => update('effective_date', event.target.value)} required />
        </FormField>
      </div>
      <div className="salary-change-footer">
        <span>All amounts remain in the selected currency.</span>
        <div><button className="form-cancel-button" type="button" onClick={onCancel}>Cancel</button><button className="add-person-button" type="submit" disabled={isSaving}>{isSaving ? 'Saving change…' : 'Save salary change'} <span aria-hidden="true">↗</span></button></div>
      </div>
    </form>
  )
}

type FormProps = {
  employee: Employee | null
  onCancel: () => void
  onSaved: (employeeNumber?: string) => void
}

function EmployeeForm({ employee, onCancel, onSaved }: FormProps) {
  const [values, setValues] = useState<FormValues>(() => employee ? {
    employee_number: employee.employee_number,
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email ?? '',
    country_code: employee.country_code,
    department: employee.department,
    job_title: employee.job_title,
    status: employee.status,
    hire_date: employee.hire_date,
  } : { ...blankForm, hire_date: localToday() })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: [] }))
  }

  function fieldError(key: keyof FormValues) {
    return errors[key]?.[0]
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})
    setMessage(null)
    setIsSaving(true)

    const payload: EmployeeInput = {
      ...values,
      email: values.email.trim() || null,
      country_code: values.country_code.trim().toUpperCase(),
    }

    try {
      if (employee) {
        const { data } = await updateEmployee(employee.employee_number, payload)
        onSaved(data.employee_number)
      } else {
        await createEmployee(payload)
        onSaved()
      }
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.errors) setErrors(caughtError.errors)
      setMessage(caughtError instanceof Error ? caughtError.message : 'The record could not be saved.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="employee-form-page" aria-labelledby="employee-form-title">
      <button className="back-link" type="button" onClick={onCancel}><span aria-hidden="true">←</span> Cancel and return</button>
      <p className="workspace-kicker">People register <span className="directory-slash">/</span> {employee ? 'Edit' : 'New record'}</p>
      <h1 className="form-page-title" id="employee-form-title">{employee ? 'Make a careful update.' : 'Add a person to the ledger.'}</h1>
      <p className="form-page-intro">Employee details are held separately from salary changes, so each record stays easy to understand.</p>

      {message && <p className="form-notice form-page-error" role="alert">{message}</p>}

      <form className="employee-data-form" onSubmit={handleSubmit}>
        <div className="form-section-label"><span>01</span> Identity</div>
        <div className="form-fields-grid">
          <FormField label="Employee number" error={fieldError('employee_number')}>
            <input value={values.employee_number} onChange={(event) => update('employee_number', event.target.value)} maxLength={32} required disabled={Boolean(employee)} />
          </FormField>
          <FormField label="Work email" error={fieldError('email')}>
            <input type="email" value={values.email} onChange={(event) => update('email', event.target.value)} />
          </FormField>
          <FormField label="First name" error={fieldError('first_name')}>
            <input value={values.first_name} onChange={(event) => update('first_name', event.target.value)} required />
          </FormField>
          <FormField label="Last name" error={fieldError('last_name')}>
            <input value={values.last_name} onChange={(event) => update('last_name', event.target.value)} required />
          </FormField>
        </div>

        <div className="form-section-label"><span>02</span> Organization</div>
        <div className="form-fields-grid">
          <FormField label="Country code" error={fieldError('country_code')}>
            <input value={values.country_code} onChange={(event) => update('country_code', event.target.value.toUpperCase())} maxLength={2} placeholder="US" required />
          </FormField>
          <FormField label="Department" error={fieldError('department')}>
            <input value={values.department} onChange={(event) => update('department', event.target.value)} required />
          </FormField>
          <FormField label="Job title" error={fieldError('job_title')}>
            <input value={values.job_title} onChange={(event) => update('job_title', event.target.value)} required />
          </FormField>
          <FormField label="Employment status" error={fieldError('status')}>
            <select value={values.status} onChange={(event) => update('status', event.target.value as Employee['status'])}>
              <option value="active">Active</option>
              <option value="on_leave">On leave</option>
              <option value="terminated">Former</option>
            </select>
          </FormField>
          <FormField label="Hire date" error={fieldError('hire_date')}>
            <input type="date" value={values.hire_date} onChange={(event) => update('hire_date', event.target.value)} required />
          </FormField>
        </div>

        <div className="employee-form-actions">
          <button className="form-cancel-button" type="button" onClick={onCancel}>Cancel</button>
          <button className="add-person-button" type="submit" disabled={isSaving}>
            {isSaving ? 'Saving record…' : employee ? 'Save changes' : 'Add to register'} <span aria-hidden="true">↗</span>
          </button>
        </div>
      </form>
    </section>
  )
}

type FormFieldProps = {
  label: string
  error?: string
  children: ReactNode
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <label className={`form-field${error ? ' has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  )
}

function SalaryValue({ record }: { record: SalaryRecord | null }) {
  if (!record) return <span className="salary-missing">Not recorded</span>
  return <span className="salary-value"><strong>{formatAmount(record.amount)}</strong><small>{record.currency}</small></span>
}

function StatusTag({ status }: { status: Employee['status'] }) {
  const label = status === 'on_leave' ? 'On leave' : status === 'terminated' ? 'Former' : 'Active'
  return <span className={`status-tag status-${status}`}><i />{label}</span>
}

function formatAmount(amount: string) {
  const [integer, fraction] = amount.split('.')
  const groupedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return fraction ? `${groupedInteger}.${fraction.replace(/0+$/, '') || '0'}` : groupedInteger
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day))
}

function localToday() {
  const today = new Date()
  return [today.getFullYear(), (today.getMonth() + 1).toString().padStart(2, '0'), today.getDate().toString().padStart(2, '0')].join('-')
}

function dateAfter(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  const next = new Date(year, month - 1, day + 1)
  return [next.getFullYear(), (next.getMonth() + 1).toString().padStart(2, '0'), next.getDate().toString().padStart(2, '0')].join('-')
}

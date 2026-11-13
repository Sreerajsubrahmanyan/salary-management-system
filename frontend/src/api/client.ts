import type {
  EmployeeDirectoryPayload,
  EmployeeFilters,
  EmployeeInput,
  EmployeePayload,
  PayReportFilters,
  PayReportPayload,
  SessionPayload,
  SalaryRecord,
  SalaryRecordInput,
  SignInCredentials,
  ValidationErrors,
} from './types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
let csrfToken: string | undefined
let sessionRequest: Promise<SessionPayload> | undefined

export class ApiError extends Error {
  readonly status: number
  readonly errors?: ValidationErrors

  constructor(message: string, status: number, errors?: ValidationErrors) {
    super(message)
    this.status = status
    this.errors = errors
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (init.body) headers.set('Content-Type', 'application/json')

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    if (!csrfToken) await getSession()
    if (csrfToken) headers.set('X-CSRF-Token', csrfToken)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method,
    headers,
    credentials: 'include',
  })

  if (response.status === 204) return undefined as T

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.error === 'string'
      ? payload.error
      : isRecord(payload) && isRecord(payload.errors)
        ? 'Check the highlighted fields and try again.'
        : `The request failed (${response.status}).`
    const errors = isRecord(payload) && isRecord(payload.errors)
      ? payload.errors as ValidationErrors
      : undefined
    throw new ApiError(message, response.status, errors)
  }

  if (isRecord(payload) && typeof payload.csrf_token === 'string') {
    csrfToken = payload.csrf_token
  }

  return payload as T
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getSession(): Promise<SessionPayload> {
  if (!sessionRequest) {
    sessionRequest = request<SessionPayload>('/api/v1/session').finally(() => {
      sessionRequest = undefined
    })
  }
  return sessionRequest
}

export function signIn(credentials: SignInCredentials): Promise<SessionPayload> {
  return request<SessionPayload>('/api/v1/session', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export async function signOut(): Promise<void> {
  await request<void>('/api/v1/session', { method: 'DELETE' })
  csrfToken = undefined
}

export function listEmployees(filters: EmployeeFilters = {}): Promise<EmployeeDirectoryPayload> {
  const search = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value))
  })
  const query = search.size > 0 ? `?${search.toString()}` : ''
  return request<EmployeeDirectoryPayload>(`/api/v1/employees${query}`)
}

export function getEmployee(employeeNumber: string): Promise<EmployeePayload> {
  return request<EmployeePayload>(`/api/v1/employees/${encodeURIComponent(employeeNumber)}`)
}

export function createEmployee(employee: EmployeeInput): Promise<EmployeePayload> {
  return request<EmployeePayload>('/api/v1/employees', {
    method: 'POST',
    body: JSON.stringify({ employee }),
  })
}

export function updateEmployee(employeeNumber: string, employee: Partial<EmployeeInput>): Promise<EmployeePayload> {
  return request<EmployeePayload>(`/api/v1/employees/${encodeURIComponent(employeeNumber)}`, {
    method: 'PATCH',
    body: JSON.stringify({ employee }),
  })
}

export function createSalaryRecord(employeeNumber: string, salaryRecord: SalaryRecordInput): Promise<{ data: SalaryRecord }> {
  return request<{ data: SalaryRecord }>(`/api/v1/employees/${encodeURIComponent(employeeNumber)}/salary_records`, {
    method: 'POST',
    body: JSON.stringify({ salary_record: salaryRecord }),
  })
}

export function getPayReport(filters: PayReportFilters = {}): Promise<PayReportPayload> {
  const search = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value))
  })
  const query = search.toString()
  return request<PayReportPayload>(`/api/v1/reports/pay${query ? `?${query}` : ''}`)
}

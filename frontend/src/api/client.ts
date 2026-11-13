import type { SessionPayload, SignInCredentials } from './types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
let csrfToken: string | undefined
let sessionRequest: Promise<SessionPayload> | undefined

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
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
      : `The request failed (${response.status}).`
    throw new ApiError(message, response.status)
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

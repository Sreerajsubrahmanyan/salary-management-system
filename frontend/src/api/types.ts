export type SessionUser = {
  email: string
  role: 'hr_manager'
}

export type SessionPayload = {
  user: SessionUser | null
  csrf_token: string
}

export type SignInCredentials = {
  email: string
  password: string
}

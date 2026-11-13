import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signIn } from '../api/client'
import type { SessionUser } from '../api/types'
import { SignIn } from './SignIn'

vi.mock('../api/client', () => ({ signIn: vi.fn() }))

describe('SignIn', () => {
  beforeEach(() => vi.clearAllMocks())

  it('introduces the product as an HR workspace with people and pay context', () => {
    render(<SignIn onSignedIn={vi.fn()} />)

    expect(screen.getByRole('heading', { name: /people first.*pay, understood/i })).toBeTruthy()
    expect(screen.getByText('People & pay / Secure access')).toBeTruthy()
    expect(screen.getByText(/manage employee records and see how your organization pays people/i)).toBeTruthy()
    expect(screen.getByText('Inside your HR workspace')).toBeTruthy()
    expect(screen.queryByText(/what belongs in view/i)).toBeNull()
  })

  it('submits credentials and hands the authenticated HR user to the app', async () => {
    const user: SessionUser = { email: 'hr@example.test', role: 'hr_manager' }
    const onSignedIn = vi.fn()
    vi.mocked(signIn).mockResolvedValue({ user, csrf_token: 'csrf-token' })

    render(<SignIn onSignedIn={onSignedIn} />)
    fireEvent.change(screen.getByLabelText('Work email'), { target: { value: user.email } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'correct-horse-battery' } })
    fireEvent.click(screen.getByRole('button', { name: /enter the workspace/i }))

    await waitFor(() => expect(signIn).toHaveBeenCalledWith({ email: user.email, password: 'correct-horse-battery' }))
    expect(onSignedIn).toHaveBeenCalledWith(user)
  })

  it('shows a useful credential error and allows password visibility to be toggled', async () => {
    vi.mocked(signIn).mockRejectedValue(new Error('Invalid email or password'))
    render(<SignIn onSignedIn={vi.fn()} />)

    const password = screen.getByLabelText('Password')
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect((password as HTMLInputElement).type).toBe('text')

    fireEvent.change(screen.getByLabelText('Work email'), { target: { value: 'hr@example.test' } })
    fireEvent.change(password, { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByRole('button', { name: /enter the workspace/i }))

    expect((await screen.findByRole('alert')).textContent).toContain('Invalid email or password')
  })
})

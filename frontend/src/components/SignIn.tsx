import { useState, type FormEvent } from 'react'
import { signIn } from '../api/client'
import type { SessionUser } from '../api/types'
import { BrandMark } from './BrandMark'
import './SignIn.css'

type SignInProps = {
  notice?: string
  onSignedIn: (user: SessionUser) => void
}

const ledgerRows = [
  { label: '01 / people', value: 'Employee register' },
  { label: '02 / pay', value: 'Salary history' },
  { label: '03 / insight', value: 'Pay reporting' },
]

export function SignIn({ notice, onSignedIn }: SignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const session = await signIn({ email, password })
      if (!session.user) throw new Error('Your account could not be verified. Check your sign-in details.')
      onSignedIn(session.user)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Sign-in failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page auth-page-v2">
      <section className="brand-panel" aria-labelledby="brand-heading">
        <header className="brand-lockup">
          <BrandMark />
          <span className="brand-edition">HR OPERATIONS / 2026</span>
        </header>

        <div className="brand-copy">
          <p className="eyebrow">A clearer view of your people</p>
          <h1 id="brand-heading">People first.<br /><em>Pay, understood.</em></h1>
          <p>A secure HR workspace for your employee register, salary histories, and clear pay reporting.</p>
        </div>

        <div className="ledger-art" role="img" aria-label="Employee records, salary history, and HR reporting">
          <div className="ledger-art-head"><span className="micro-label">Inside your HR workspace</span></div>
          {ledgerRows.map((row) => (
            <div className="ledger-row" key={row.label}>
              <span className="ledger-row-label">{row.label}</span>
              <span className="ledger-row-value">{row.value}</span>
            </div>
          ))}
        </div>

        <footer className="panel-footer">
          <span>Private by design</span>
          <span>Built for careful decisions</span>
        </footer>
      </section>

      <section className="form-panel" aria-labelledby="signin-heading">
        <div className="form-topline"><span>HR MANAGER ACCESS <i aria-hidden="true">●</i> ENCRYPTED SESSION</span></div>

        <div className="signin-card">
          <p className="form-kicker">People &amp; pay / Secure access</p>
          <h2 id="signin-heading">Welcome<br />back.</h2>
          <p className="signin-intro">Sign in to manage employee records and see how your organization pays people.</p>

          {notice && <p className="form-notice" role="status">{notice}</p>}
          {error && <p className="form-notice" role="alert">{error}</p>}

          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="work-email">Work email</label>
              <input
                className="field-control"
                type="email"
                id="work-email"
                name="email"
                autoComplete="username"
                placeholder="you@organization.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <span className="password-wrap">
                <input
                  className="field-control"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </div>

            <button className="submit-button" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Checking your details…' : 'Enter the workspace'}</span>
              <span className="submit-arrow" aria-hidden="true">↗</span>
            </button>
          </form>

          <p className="security-note">Secure session · Your details stay private</p>
        </div>

        <footer className="form-footer">
          <span>Folio · People &amp; Pay</span>
          <span>For authorized HR users</span>
        </footer>
      </section>
    </main>
  )
}

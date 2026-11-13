import { useState, type FormEvent } from 'react'
import { signIn } from '../api/client'
import type { SessionUser } from '../api/types'
import { BrandMark } from './BrandMark'
import './SignIn.css'

type SignInProps = {
  notice?: string
  onSignedIn: (user: SessionUser) => void
}

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
          <p>A secure place for the people and decisions that shape your organization.</p>
        </div>

        <div className="brand-art" aria-hidden="true">
          <svg viewBox="0 0 620 210" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="brand-art-gradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#72e0c9" stopOpacity=".25" />
                <stop offset=".52" stopColor="#72e0c9" />
                <stop offset="1" stopColor="#e6a18a" />
              </linearGradient>
            </defs>
            <path className="brand-art-thread brand-art-thread-muted" d="M-24 153C78 99 116 182 202 142S314 43 393 87s112 95 251 8" />
            <path className="brand-art-thread brand-art-thread-muted" d="M-20 174C72 124 118 199 210 160S322 68 398 108s117 92 246 18" />
            <path className="brand-art-thread brand-art-thread-muted" d="M-18 194C74 149 127 216 217 180S330 92 405 129s117 87 237 29" />
            <path className="brand-art-thread brand-art-thread-focus" d="M-18 127C76 77 118 157 202 119S314 20 393 64s112 95 251 8" />
            <circle className="brand-art-orbit" cx="203" cy="119" r="7" />
            <circle className="brand-art-orbit brand-art-orbit-accent" cx="393" cy="64" r="5" />
          </svg>
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
          <p className="signin-intro">Sign in to access your organization’s HR workspace.</p>

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

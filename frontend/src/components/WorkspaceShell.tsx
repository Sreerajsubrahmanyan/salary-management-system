import { useState } from 'react'
import type { SessionUser } from '../api/types'
import { BrandMark } from './BrandMark'
import { EmployeeWorkspace } from './EmployeeWorkspace'
import { PayIntelligence } from './PayIntelligence'

type WorkspaceShellProps = {
  user: SessionUser
  onSignOut: () => Promise<void>
}

export function WorkspaceShell({ user, onSignOut }: WorkspaceShellProps) {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const [section, setSection] = useState<'people' | 'pay'>('people')
  const initials = user.email.slice(0, 1).toUpperCase()

  async function handleSignOut() {
    setSignOutError(null)
    setIsSigningOut(true)
    try {
      await onSignOut()
    } catch {
      setSignOutError('We could not close your session. Please try once more.')
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <main className="workspace-page">
      <aside className="workspace-rail">
        <BrandMark />
        <p className="workspace-nav-label">Your desk</p>
        <nav className="workspace-nav" aria-label="Main navigation">
          <button className="workspace-nav-item" type="button" aria-current={section === 'people' ? 'page' : undefined} onClick={() => setSection('people')}>
            <span className="workspace-nav-symbol" aria-hidden="true">≋</span>
            <span>People register</span>
          </button>
          <button className="workspace-nav-item" type="button" aria-current={section === 'pay' ? 'page' : undefined} onClick={() => setSection('pay')}>
            <span className="workspace-nav-symbol" aria-hidden="true">◫</span>
            <span>Salary analytics</span>
            <span className="workspace-nav-status">LIVE</span>
          </button>
        </nav>
        <p className="rail-bottom">A clear record is a fairer conversation.<br />Folio · HR workspace</p>
      </aside>

      <section className="workspace-main">
        <header className="workspace-topbar">
          <p>Human resources <span aria-hidden="true">/</span> {section === 'people' ? 'People register' : 'Salary analytics'}</p>
          <div className="user-menu">
            <span className="user-initials" aria-hidden="true">{initials}</span>
            <span className="user-email">{user.email}</span>
            <button className="signout-button" type="button" onClick={handleSignOut} disabled={isSigningOut}>
              {isSigningOut ? 'Leaving…' : 'Sign out'}
            </button>
          </div>
        </header>

        {signOutError && <p className="form-notice" role="alert">{signOutError}</p>}

        {section === 'people' ? <EmployeeWorkspace /> : <PayIntelligence />}
      </section>
    </main>
  )
}

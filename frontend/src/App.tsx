import { useEffect, useState } from 'react'
import { getSession, signOut } from './api/client'
import type { SessionUser } from './api/types'
import { SignIn } from './components/SignIn'
import { WorkspaceShell } from './components/WorkspaceShell'
import './App.css'

type AppState =
  | { status: 'loading' }
  | { status: 'signed-out'; notice?: string }
  | { status: 'signed-in'; user: SessionUser }

function App() {
  const [state, setState] = useState<AppState>({ status: 'loading' })

  useEffect(() => {
    let active = true

    getSession()
      .then(({ user }) => {
        if (active) setState(user ? { status: 'signed-in', user } : { status: 'signed-out' })
      })
      .catch(() => {
        if (active) {
          setState({
            status: 'signed-out',
            notice: 'The workspace could not be reached. Check that the API is running, then try again.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [])

  async function handleSignOut() {
    await signOut()
    setState({ status: 'signed-out' })
  }

  if (state.status === 'loading') {
    return (
      <main className="loading-screen" aria-label="Loading workspace">
        <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
        <p>Opening the ledger<span className="loading-dots">···</span></p>
      </main>
    )
  }

  if (state.status === 'signed-in') {
    return <WorkspaceShell user={state.user} onSignOut={handleSignOut} />
  }

  return <SignIn notice={state.notice} onSignedIn={(user) => setState({ status: 'signed-in', user })} />
}

export default App

import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Loading from '../components/Loading.jsx'
import { getAuthErrorMessage } from '../utils/authErrorMessage.js'

function RequireAuth({ role, children }) {
  const { session, profile, profileError, loading, signOut } = useAuth()
  const location = useLocation()
  const [signOutError, setSignOutError] = useState('')

  async function handleSignOut() {
    const { error } = await signOut()
    if (error) {
      setSignOutError(getAuthErrorMessage(error, 'logout'))
    }
  }

  if (loading) {
    return <Loading label="Checking your account" />
  }

  if (!session) {
    return (
      <Navigate
        to={role === 'admin' ? '/admin/login' : '/login'}
        replace
        state={{ from: location }}
      />
    )
  }

  if (profileError || !profile) {
    return (
      <div className="auth-route-message" role="alert">
        <h1>Account access is unavailable</h1>
        <p>
          {getAuthErrorMessage(profileError, 'profile')}
        </p>
        <button className="button button--outline" type="button" onClick={handleSignOut}>
          Sign out
        </button>
        {signOutError && <p className="auth-feedback auth-feedback--error" role="alert">{signOutError}</p>}
      </div>
    )
  }

  if (profile.role !== 'admin' && profile.role !== 'customer') {
    return (
      <div className="auth-route-message" role="alert">
        <h1>Access denied</h1>
        <p>Your account does not have a recognized workspace role. Contact an administrator.</p>
        <button className="button button--outline" type="button" onClick={handleSignOut}>
          Sign out
        </button>
        {signOutError && <p className="auth-feedback auth-feedback--error" role="alert">{signOutError}</p>}
      </div>
    )
  }

  if (profile.role !== role) {
    const workspacePath = profile.role === 'admin' ? '/admin' : '/dashboard'
    const workspaceLabel = profile.role === 'admin' ? 'admin' : 'customer'
    return (
      <div className="auth-route-message" role="alert">
        <h1>Access denied</h1>
        <p>This area is restricted to {role} accounts.</p>
        <Link className="button button--outline" to={workspacePath}>
          Go to your {workspaceLabel} workspace
        </Link>
      </div>
    )
  }

  return children
}

export default RequireAuth

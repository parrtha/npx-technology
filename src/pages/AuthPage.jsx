import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Loading from '../components/Loading.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getAuthErrorMessage } from '../utils/authErrorMessage.js'

const config = {
  login: {
    eyebrow: 'Client portal',
    title: 'Welcome back.',
    description: 'Sign in to continue to your NPX workspace.',
    submit: 'Sign in',
    loading: 'Signing in…',
  },
  register: {
    eyebrow: 'Create your account',
    title: 'Create your NPX account',
    description: 'A few details are all we need to set up your secure customer account.',
    submit: 'Create account',
    loading: 'Creating account…',
  },
  admin: {
    eyebrow: 'Team access',
    title: 'Admin sign in.',
    description: 'This area is for authorized NPX administrators only.',
    submit: 'Sign in as admin',
    loading: 'Signing in…',
  },
  forgot: {
    eyebrow: 'Account recovery',
    title: 'Reset your password.',
    description: 'We’ll email you a secure link to choose a new password.',
    submit: 'Send reset link',
    loading: 'Sending reset link…',
  },
  reset: {
    eyebrow: 'Account recovery',
    title: 'Choose a new password.',
    description: 'Use a strong password you have not used elsewhere.',
    submit: 'Update password',
    loading: 'Updating password…',
  },
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePassword(password) {
  return password.length >= 8
}

function roleHome(role) {
  return role === 'admin' ? '/admin' : '/dashboard'
}

function getErrorContext(mode) {
  if (mode === 'register') {
    return 'registration'
  }
  if (mode === 'login' || mode === 'admin') {
    return 'login'
  }
  if (mode === 'forgot') {
    return 'passwordRecovery'
  }
  if (mode === 'reset') {
    return 'passwordReset'
  }
  return 'default'
}

function AuthPage({ mode }) {
  const page = config[mode]
  const { session, profile, profileError, loading, signIn, signUp, signOut,
    requestPasswordReset, updatePassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const isSubmittingRef = useRef(false)
  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8, required: true },
    { label: '12 or more characters', met: password.length >= 12, required: false },
    { label: 'Uppercase and lowercase letters', met: /[A-Z]/.test(password) && /[a-z]/.test(password), required: false },
    { label: 'A number or symbol', met: /[\d]|[^A-Za-z0-9\s]/.test(password), required: false },
  ]
  const passwordStrengthScore = passwordRequirements.filter(({ met }) => met).length
  const passwordStrength = password.length === 0
    ? 'Not entered'
    : ['Weak', 'Fair', 'Good', 'Strong', 'Strong'][passwordStrengthScore]

  function clearFieldErrors(...fields) {
    setFieldErrors((current) => {
      if (!fields.some((field) => current[field])) {
        return current
      }

      const nextErrors = { ...current }
      fields.forEach((field) => delete nextErrors[field])
      return nextErrors
    })
  }

  useEffect(() => {
    if (loading || !session || !profile) {
      return
    }

    if (mode === 'admin' && profile.role !== 'admin') {
      return
    }

    if (mode === 'login' || mode === 'register' || mode === 'admin') {
      const requestedPath = location.state?.from?.pathname
      const destination = requestedPath?.startsWith('/')
        && !requestedPath.startsWith('//')
        ? requestedPath
        : roleHome(profile.role)
      navigate(destination, { replace: true })
    }
  }, [loading, location.state, mode, navigate, profile, session])

  function validateForm() {
    const nextErrors = {}
    const normalizedEmail = email.trim()

    if (!validateEmail(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (mode === 'register' && !fullName.trim()) {
      nextErrors.fullName = 'Enter your full name.'
    }

    if (mode === 'login' || mode === 'admin' || mode === 'register' || mode === 'reset') {
      if (!validatePassword(password)) {
        nextErrors.password = 'Use at least 8 characters.'
      }
    }

    if ((mode === 'register' || mode === 'reset') && password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSignOut() {
    const { error } = await signOut()
    if (error) {
      setErrorMessage(getAuthErrorMessage(error, 'logout'))
      return
    }
    navigate('/login', { replace: true })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmittingRef.current || registrationComplete) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')

    if (mode === 'reset' && !session) {
      setErrorMessage('This password reset link is invalid or has expired. Request a new link.')
      return
    }

    if (!validateForm()) {
      return
    }

    isSubmittingRef.current = true
    setIsSubmitting(true)
    const normalizedEmail = email.trim().toLowerCase()

    try {
      if (mode === 'register') {
        const { data, error } = await signUp({
          email: normalizedEmail,
          password,
          fullName: fullName.trim(),
        })
        if (error) {
          setErrorMessage(getAuthErrorMessage(error, 'registration'))
        } else if (!data.user) {
          setErrorMessage(getAuthErrorMessage(null, 'registration'))
        } else if (data.session) {
          setSuccessMessage('Your account is ready. Taking you to your workspace…')
          navigate('/dashboard', { replace: true })
        } else {
          setRegistrationComplete(true)
        }
      } else if (mode === 'login' || mode === 'admin') {
        const { profile: signedInProfile, error } = await signIn({
          email: normalizedEmail,
          password,
        })
        if (error) {
          setErrorMessage(getAuthErrorMessage(error, 'login'))
        } else if (mode === 'admin' && signedInProfile?.role !== 'admin') {
          const { error: signOutError } = await signOut()
          setErrorMessage(signOutError
            ? `This account does not have admin access. ${getAuthErrorMessage(signOutError, 'logout')}`
            : 'This account does not have admin access.')
        } else if (!signedInProfile) {
          setErrorMessage(getAuthErrorMessage(null, 'profile'))
        } else {
          const requestedPath = location.state?.from?.pathname
          const fallback = roleHome(signedInProfile.role)
          navigate(
            requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
              ? requestedPath
              : fallback,
            { replace: true },
          )
        }
      } else if (mode === 'forgot') {
        const { error } = await requestPasswordReset(normalizedEmail)
        if (error) {
          setErrorMessage(getAuthErrorMessage(error, 'passwordRecovery'))
        } else {
          setSuccessMessage('If an account exists for that email, a password reset link is on its way.')
        }
      } else if (mode === 'reset') {
        const { error } = await updatePassword(password)
        if (error) {
          setErrorMessage(getAuthErrorMessage(error, 'passwordReset'))
        } else {
          setSuccessMessage('Your password has been updated.')
        }
      }
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, getErrorContext(mode)))
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  if (loading && mode !== 'forgot') {
    return <div className="auth-loading"><Loading label="Loading your account" /></div>
  }

  if (profileError && session && mode !== 'reset') {
    return (
      <div className="auth-loading">
        <div className="auth-route-message" role="alert">
          <h1>Account profile unavailable</h1>
          <p>{getAuthErrorMessage(profileError, 'profile')}</p>
          <button className="button button--outline" type="button" onClick={handleSignOut}>
            Sign out
          </button>
          {errorMessage && <p className="auth-feedback auth-feedback--error" role="alert">{errorMessage}</p>}
        </div>
      </div>
    )
  }

  if (mode === 'admin' && session && profile?.role !== 'admin' && !loading) {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <p className="eyebrow"><span className="eyebrow__dot" /> Team access</p>
          <h1>Admin access required.</h1>
          <p className="auth-card__description">This signed-in account does not have an administrator role.</p>
          <button
            className="button button--primary auth-submit"
            type="button"
            onClick={handleSignOut}
          >
            Sign out
          </button>
          {errorMessage && <p className="auth-feedback auth-feedback--error" role="alert">{errorMessage}</p>}
        </div>
      </section>
    )
  }

  if (mode === 'reset' && !session && !loading) {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <p className="eyebrow"><span className="eyebrow__dot" /> Account recovery</p>
          <h1>Reset link required.</h1>
          <p className="auth-card__description">Open the password reset link from your email, or request a new one.</p>
          <Link className="button button--primary auth-submit" to="/forgot-password">Request a reset link</Link>
        </div>
      </section>
    )
  }

  return (
    <section className={`auth-page${mode === 'register' ? ' auth-page--register' : ''}`}>
      <div className={`auth-card${mode === 'register' ? ' auth-card--register' : ''}`}>
        <p className="eyebrow"><span className="eyebrow__dot" /> {page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className="auth-card__description">{page.description}</p>
        {!session && location.state?.from?.pathname && (
          <p className="auth-feedback auth-feedback--notice" role="status">
            Your session is missing or expired. Sign in to continue.
          </p>
        )}

        {mode === 'register' && registrationComplete ? (
          <div className="registration-success" role="status" aria-live="polite">
            <span className="registration-success__icon" aria-hidden="true">
              <Mail size={24} />
              <Check size={13} />
            </span>
            <p className="eyebrow"><span className="eyebrow__dot" /> Almost there</p>
            <h2>Check your email</h2>
            <p>
              If email confirmation is enabled, check your inbox for a verification link and use it
              to confirm your address before signing in. Check your spam folder if it doesn&apos;t arrive.
            </p>
            <Link className="button button--primary auth-submit" to="/login">
              Continue to sign in <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
          {mode === 'register' && (
            <label className="auth-field" htmlFor="full-name">
              <span>Full name</span>
              <span className="auth-input-wrap">
                <UserRound size={17} aria-hidden="true" />
                <input
                  autoComplete="name"
                  id="full-name"
                  name="name"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value)
                    clearFieldErrors('fullName')
                  }}
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  aria-describedby={fieldErrors.fullName ? 'full-name-error' : undefined}
                  required
                />
              </span>
              {fieldErrors.fullName && <span className="auth-field__error" id="full-name-error">{fieldErrors.fullName}</span>}
            </label>
          )}

          {mode !== 'reset' && (
            <label className="auth-field" htmlFor="email">
              <span>Email address</span>
              <span className="auth-input-wrap">
                <Mail size={17} aria-hidden="true" />
                <input
                  autoComplete="email"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    clearFieldErrors('email')
                  }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  required
                />
              </span>
              {fieldErrors.email && <span className="auth-field__error" id="email-error">{fieldErrors.email}</span>}
            </label>
          )}

          {(mode === 'login' || mode === 'admin' || mode === 'register' || mode === 'reset') && (
            <label className="auth-field" htmlFor="password">
              <span>{mode === 'reset' ? 'New password' : 'Password'}</span>
              <span className="auth-input-wrap">
                <LockKeyhole size={17} aria-hidden="true" />
                <input
                  autoComplete={mode === 'register' ? 'new-password' : mode === 'reset' ? 'new-password' : 'current-password'}
                  id="password"
                  name="password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Create a password' : undefined}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    clearFieldErrors('password', 'confirmPassword')
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password
                      ? mode === 'register' ? 'password-guidance password-error' : 'password-error'
                      : mode === 'register' ? 'password-guidance' : undefined
                  }
                  minLength={8}
                  required
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                >
                  {isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
              {fieldErrors.password && <span className="auth-field__error" id="password-error">{fieldErrors.password}</span>}
              {mode === 'register' && (
                <div className="password-guidance" id="password-guidance">
                  <div className="password-strength">
                    <span>Password strength</span>
                    <strong aria-live="polite">{passwordStrength}</strong>
                  </div>
                  <div
                    className="password-strength__meter"
                    role="meter"
                    aria-label="Password strength"
                    aria-valuemin={0}
                    aria-valuemax={4}
                    aria-valuenow={passwordStrengthScore}
                    aria-valuetext={passwordStrength}
                  >
                    {passwordRequirements.map(({ label }, index) => (
                      <span
                        key={label}
                        className={index < passwordStrengthScore ? 'is-filled' : ''}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <ul className="password-requirements" aria-label="Password requirements">
                    {passwordRequirements.map(({ label, met, required }) => (
                      <li key={label} className={met ? 'is-met' : ''}>
                        <Check size={13} aria-hidden="true" />
                        <span>{label}{required ? ' · required' : ' · recommended'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </label>
          )}

          {(mode === 'register' || mode === 'reset') && (
            <label className="auth-field" htmlFor="confirm-password">
              <span>Confirm password</span>
              <span className="auth-input-wrap">
                <LockKeyhole size={17} aria-hidden="true" />
                <input
                  autoComplete="new-password"
                  id="confirm-password"
                  name="confirm-password"
                  type={isConfirmVisible ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    clearFieldErrors('confirmPassword')
                  }}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
                  minLength={8}
                  required
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setIsConfirmVisible((visible) => !visible)}
                  aria-label={isConfirmVisible ? 'Hide password confirmation' : 'Show password confirmation'}
                >
                  {isConfirmVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
              {fieldErrors.confirmPassword && <span className="auth-field__error" id="confirm-password-error">{fieldErrors.confirmPassword}</span>}
            </label>
          )}

          {mode === 'login' && (
            <div className="auth-form__meta">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          )}

          {errorMessage && <p className="auth-feedback auth-feedback--error" role="alert">{errorMessage}</p>}
          {successMessage && <p className="auth-feedback auth-feedback--success" role="status">{successMessage}</p>}

          <button
            className="button button--primary auth-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <><span className="auth-spinner" aria-hidden="true" /> {page.loading}</>
              : <>{page.submit} <ArrowRight size={17} aria-hidden="true" /></>}
          </button>
        </form>
        )}

        {mode === 'login' && (
          <p className="auth-card__switch">New to NPX? <Link to="/register">Create a customer account</Link></p>
        )}
        {mode === 'register' && !registrationComplete && (
          <p className="auth-card__switch">Already have an account? <Link to="/login">Sign in</Link></p>
        )}
        {mode === 'forgot' && (
          <p className="auth-card__switch"><Link to="/login"><ArrowLeft size={15} /> Back to sign in</Link></p>
        )}
        {mode === 'admin' && (
          <p className="auth-card__switch"><Link to="/login">Customer sign in</Link></p>
        )}
        {mode === 'reset' && successMessage && (
          <p className="auth-card__switch"><Link to="/login">Continue to sign in</Link></p>
        )}
        {mode !== 'admin' && mode !== 'forgot' && mode !== 'reset' && (
          <Link className="auth-card__admin-link" to="/admin/login">NPX team sign in</Link>
        )}
      </div>
    </section>
  )
}

export default AuthPage

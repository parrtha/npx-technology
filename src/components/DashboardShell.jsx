import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronRight, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { classNames } from '../utils/classNames.js'
import { useAuth } from '../hooks/useAuth.js'
import { getAuthErrorMessage } from '../utils/authErrorMessage.js'
import ThemeToggle from './ThemeToggle.jsx'

function DashboardShell({
  title,
  subtitle,
  basePath,
  navigation,
  children,
  showSidebarSignOut = false,
  adminAccount = false,
  workspaceNote = 'Workspace setup',
  workspaceStatus = 'Coming soon',
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileLayout, setIsMobileLayout] = useState(
    () => window.matchMedia('(max-width: 740px)').matches,
  )
  const [signOutError, setSignOutError] = useState('')
  const sidebarRef = useRef(null)
  const menuButtonRef = useRef(null)
  const restoreMenuFocus = useRef(false)
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const adminName = profile?.full_name?.trim() || user?.email || 'Administrator'
  const adminInitials = adminName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 740px)')
    const handleViewportChange = (event) => {
      setIsMobileLayout(event.matches)
      if (!event.matches) {
        setIsMenuOpen(false)
      }
    }

    mediaQuery.addEventListener('change', handleViewportChange)
    return () => mediaQuery.removeEventListener('change', handleViewportChange)
  }, [])

  useEffect(() => {
    if (isMobileLayout && isMenuOpen) {
      restoreMenuFocus.current = true
      sidebarRef.current?.querySelector('.dashboard-nav a')?.focus()
      return
    }

    if (restoreMenuFocus.current) {
      restoreMenuFocus.current = false
      if (isMobileLayout) {
        menuButtonRef.current?.focus()
      }
    }
  }, [isMenuOpen, isMobileLayout])

  useEffect(() => {
    if (!isMobileLayout || !isMenuOpen) {
      return undefined
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsMenuOpen(false)
        return
      }

      if (event.key === 'Tab') {
        const focusableItems = sidebarRef.current?.querySelectorAll('a[href], button:not([disabled])')
        const firstItem = focusableItems?.[0]
        const lastItem = focusableItems?.[focusableItems.length - 1]

        if (event.shiftKey && document.activeElement === firstItem) {
          event.preventDefault()
          lastItem?.focus()
        } else if (!event.shiftKey && document.activeElement === lastItem) {
          event.preventDefault()
          firstItem?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen, isMobileLayout])

  function closeMenu() {
    setIsMenuOpen(false)
  }

  async function handleSignOut() {
    const { error } = await signOut()
    if (!error) {
      setSignOutError('')
      navigate('/login', { replace: true })
    } else {
      setSignOutError(getAuthErrorMessage(error, 'logout'))
      closeMenu()
    }
  }

  return (
    <div className={classNames(
      'dashboard-shell',
      showSidebarSignOut && 'dashboard-shell--customer',
      adminAccount && 'dashboard-shell--admin',
    )}>
      <a className="skip-link" href="#dashboard-content">Skip to dashboard content</a>
      <aside
        ref={sidebarRef}
        className={classNames('dashboard-sidebar', isMenuOpen && 'dashboard-sidebar--open')}
        id="dashboard-sidebar"
        inert={isMobileLayout && !isMenuOpen}
      >
        <NavLink className="brand dashboard-brand" to="/" onClick={closeMenu}>
          <span className="brand__mark" aria-hidden="true">N</span>
          <span className="brand__wordmark">NPX <span>TECHNOLOGY</span></span>
        </NavLink>
        <div className="dashboard-sidebar__label">{title}</div>
        <nav className="dashboard-nav" aria-label={`${title} navigation`}>
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === basePath}
              onClick={closeMenu}
              className={({ isActive }) => classNames('dashboard-nav__link', isActive && 'is-active')}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
              <ChevronRight className="dashboard-nav__chevron" size={15} aria-hidden="true" />
            </NavLink>
          ))}
          {showSidebarSignOut && (
            <button
              className="dashboard-nav__link dashboard-nav__signout"
              type="button"
              onClick={handleSignOut}
            >
              <LogOut size={18} aria-hidden="true" />
              <span>Logout</span>
            </button>
          )}
        </nav>
        <div className="dashboard-sidebar__bottom">
          <NavLink className="dashboard-back-link" to="/" onClick={closeMenu}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to website
          </NavLink>
          <div className="dashboard-sidebar__note">
            <span className="dashboard-sidebar__note-icon"><LayoutDashboard size={17} /></span>
            <span>{workspaceNote}<br /><strong>{workspaceStatus}</strong></span>
          </div>
        </div>
      </aside>

      {isMenuOpen && (
        <button
          className="dashboard-overlay"
          type="button"
          onClick={closeMenu}
          aria-label="Close navigation menu"
        />
      )}

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            ref={menuButtonRef}
            className="dashboard-menu-toggle"
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="dashboard-sidebar"
            aria-label={isMenuOpen ? 'Close dashboard navigation' : 'Open dashboard navigation'}
          >
            {isMenuOpen
              ? <X size={20} aria-hidden="true" />
              : <Menu size={20} aria-hidden="true" />}
          </button>
          <div className="dashboard-topbar__heading">
            <span>{title}</span>
            <strong>{subtitle}</strong>
          </div>
          {adminAccount ? (
            <div className="dashboard-admin-account" aria-label="Administrator profile">
              <span className="dashboard-admin-account__avatar" aria-hidden="true">{adminInitials}</span>
              <span className="dashboard-admin-account__identity">
                <strong>{profile?.full_name?.trim() || 'Administrator'}</strong>
                <span>{user?.email}</span>
              </span>
            </div>
          ) : (
            <span className="dashboard-account-email">{user?.email}</span>
          )}
          {!showSidebarSignOut && (
            <button
              className="dashboard-signout"
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <LogOut size={17} aria-hidden="true" />
              <span>Sign out</span>
            </button>
          )}
          <ThemeToggle />
        </header>
        {signOutError && <p className="dashboard-signout-error" role="alert">{signOutError}</p>}
        <main id="dashboard-content" className="dashboard-content">{children}</main>
      </div>
    </div>
  )
}

export default DashboardShell

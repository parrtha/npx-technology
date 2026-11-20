import { useState } from 'react'
import { ArrowLeft, ChevronRight, LayoutDashboard, Menu, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { classNames } from '../utils/classNames.js'
import ThemeToggle from './ThemeToggle.jsx'

function DashboardShell({ title, subtitle, basePath, navigation, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <div className="dashboard-shell">
      <aside className={classNames('dashboard-sidebar', isMenuOpen && 'dashboard-sidebar--open')}>
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
        </nav>
        <div className="dashboard-sidebar__bottom">
          <NavLink className="dashboard-back-link" to="/" onClick={closeMenu}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to website
          </NavLink>
          <div className="dashboard-sidebar__note">
            <span className="dashboard-sidebar__note-icon"><LayoutDashboard size={17} /></span>
            <span>Workspace setup<br /><strong>Coming soon</strong></span>
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
            className="dashboard-menu-toggle"
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen
              ? <X size={20} aria-hidden="true" />
              : <Menu size={20} aria-hidden="true" />}
          </button>
          <div className="dashboard-topbar__heading">
            <span>{title}</span>
            <strong>{subtitle}</strong>
          </div>
          <ThemeToggle />
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  )
}

export default DashboardShell

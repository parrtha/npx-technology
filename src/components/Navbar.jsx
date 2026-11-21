import { useState } from 'react'
import { ArrowUpRight, Mail, LogOut, Menu, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { classNames } from '../utils/classNames.js'
import { contactEmailUrl, whatsappUrl } from '../utils/contactLinks.js'
import { getAuthErrorMessage } from '../utils/authErrorMessage.js'
import { useAuth } from '../hooks/useAuth.js'
import Button from './Button.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import WhatsAppIcon from './WhatsAppIcon.jsx'

const links = [
  { to: '/services', label: 'Services' },
  { to: '/work', label: 'Our work' },
  { to: '/about', label: 'About' },
]

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const { session, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const portalPath = profile?.role === 'admin' ? '/admin' : '/dashboard'

  function closeMenu() {
    setIsMenuOpen(false)
  }

  async function handleSignOut() {
    const { error } = await signOut()
    if (error) {
      setSignOutError(getAuthErrorMessage(error, 'logout'))
      return
    }
    setSignOutError('')
    closeMenu()
    navigate('/login')
  }

  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <Link className="brand" to="/" aria-label="NPX TECHNOLOGY home" onClick={closeMenu}>
          <span className="brand__mark" aria-hidden="true">N</span>
          <span className="brand__wordmark">NPX <span>TECHNOLOGY</span></span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => classNames('nav-link', isActive && 'is-active')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <ThemeToggle />
          {(whatsappUrl || contactEmailUrl) && (
            <div className="navbar-contact-links" role="group" aria-label="Contact NPX">
              {whatsappUrl && (
                <a
                  className="navbar-contact-link"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp"
                  title="Chat on WhatsApp"
                >
                  <WhatsAppIcon />
                </a>
              )}
              {contactEmailUrl && (
                <a
                  className="navbar-contact-link navbar-contact-link--email"
                  href={contactEmailUrl}
                  aria-label="Email us"
                  title="Email us"
                >
                  <Mail size={18} aria-hidden="true" />
                </a>
              )}
            </div>
          )}
          {session
            ? <NavLink className="header-auth-link" to={portalPath}>Workspace</NavLink>
            : <NavLink className="header-auth-link" to="/login">Client login</NavLink>}
          <Button className="header-cta" to="/contact" size="small">
            Let&apos;s talk <ArrowUpRight size={16} aria-hidden="true" />
          </Button>
          <button
            className="mobile-menu-toggle"
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen
              ? <X size={21} aria-hidden="true" />
              : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <nav
        className={classNames('mobile-nav', isMenuOpen && 'mobile-nav--open')}
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!isMenuOpen}
      >
        {signOutError && <p className="mobile-nav__error" role="alert">{signOutError}</p>}
        {whatsappUrl && (
          <a
            className="mobile-nav__link mobile-nav__contact-link"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={18} /> Chat on WhatsApp
          </a>
        )}
        {contactEmailUrl && (
          <a className="mobile-nav__link mobile-nav__contact-link" href={contactEmailUrl}>
            <Mail size={17} aria-hidden="true" /> Email us
          </a>
        )}
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={closeMenu}
            className={({ isActive }) => classNames('mobile-nav__link', isActive && 'is-active')}
          >
            {link.label}
          </NavLink>
        ))}
        <NavLink className="mobile-nav__link" to="/contact" onClick={closeMenu}>Contact</NavLink>
        {session
          ? (
            <>
              <NavLink className="mobile-nav__link" to={portalPath} onClick={closeMenu}>Workspace</NavLink>
              <button className="mobile-nav__link mobile-nav__signout" type="button" onClick={handleSignOut}>
                <LogOut size={16} aria-hidden="true" /> Sign out
              </button>
            </>
          )
          : (
            <>
              <NavLink className="mobile-nav__link" to="/login" onClick={closeMenu}>Client sign in</NavLink>
              <NavLink className="mobile-nav__link" to="/admin/login" onClick={closeMenu}>NPX team sign in</NavLink>
            </>
          )}
      </nav>
    </header>
  )
}

export default Navbar

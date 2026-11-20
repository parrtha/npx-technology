import { useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { classNames } from '../utils/classNames.js'
import Button from './Button.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const links = [
  { to: '/services', label: 'Services' },
  { to: '/work', label: 'Our work' },
  { to: '/about', label: 'About' },
]

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function closeMenu() {
    setIsMenuOpen(false)
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
        <NavLink className="mobile-nav__link" to="/dashboard" onClick={closeMenu}>Client portal</NavLink>
      </nav>
    </header>
  )
}

export default Navbar

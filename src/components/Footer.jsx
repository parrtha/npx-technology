import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__main">
        <div className="site-footer__brand">
          <Link className="brand brand--footer" to="/">
            <span className="brand__mark" aria-hidden="true">N</span>
            <span className="brand__wordmark">NPX <span>TECHNOLOGY</span></span>
          </Link>
          <p>Thoughtful digital products, engineered for what&apos;s next.</p>
        </div>
        <div className="site-footer__links">
          <Link to="/services">Services</Link>
          <Link to="/work">Our work</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <Link className="footer-portal-link" to="/dashboard">
          Client portal <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <div className="container site-footer__bottom">
        <span>© NPX TECHNOLOGY</span>
        <span>Built with clarity. Designed to last.</span>
      </div>
    </footer>
  )
}

export default Footer

import { motion, useReducedMotion } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'

function PublicLayout() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  return (
    <div className="public-layout">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <motion.main
        key={location.pathname}
        id="main-content"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  )
}

export default PublicLayout

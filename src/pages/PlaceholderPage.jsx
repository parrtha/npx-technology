import { motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowUpRight, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'

function PlaceholderPage({ eyebrow = 'NPX TECHNOLOGY', title, description, actionTo = '/', actionLabel = 'Back to home' }) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="placeholder-page container">
      <motion.div
        className="placeholder-page__content"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
      >
        <span className="placeholder-page__icon"><Compass size={22} aria-hidden="true" /></span>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="placeholder-page__actions">
          <Button to={actionTo}>{actionLabel} <ArrowUpRight size={16} aria-hidden="true" /></Button>
          <Link className="subtle-link" to="/"><ArrowLeft size={15} aria-hidden="true" /> Home</Link>
        </div>
      </motion.div>
    </section>
  )
}

export default PlaceholderPage

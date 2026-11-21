import { ArrowUpRight, CircleDashed } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import Card from '../components/Card.jsx'
import SectionHeading from '../components/SectionHeading.jsx'

function WorkspacePage({ eyebrow, title, description, actionTo, actionLabel, note }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="workspace-page"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="workspace-page__heading"
      />
      <Card className="workspace-empty-state">
        <span className="workspace-empty-state__icon"><CircleDashed size={23} aria-hidden="true" /></span>
        <h2>Workspace setup is coming soon</h2>
        <p>{note}</p>
        {actionTo && (
          <Link className="workspace-empty-state__link" to={actionTo}>
            {actionLabel} <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        )}
      </Card>
      <p className="workspace-disclaimer">No account data or project activity is connected in this preview.</p>
    </motion.div>
  )
}

export default WorkspacePage

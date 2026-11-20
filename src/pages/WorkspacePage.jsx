import { ArrowUpRight, CircleDashed } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../components/Card.jsx'
import SectionHeading from '../components/SectionHeading.jsx'

function WorkspacePage({ eyebrow, title, description, actionTo, actionLabel, note }) {
  return (
    <div className="workspace-page">
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
    </div>
  )
}

export default WorkspacePage

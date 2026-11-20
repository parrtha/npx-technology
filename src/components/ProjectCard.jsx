import { ArrowUpRight, ExternalLink } from 'lucide-react'
import Card from './Card.jsx'

function ProjectCard({ project }) {
  const { name, category, description, technologies, visual, liveUrl, sourceUrl } = project

  return (
    <Card className="project-card">
      <div className={`project-card__visual project-card__visual--${visual}`} aria-hidden="true">
        <div className="project-card__mockup">
          <span className="project-card__mockup-top"><i /><i /><i /></span>
          <span className="project-card__mockup-line" />
          <span className="project-card__mockup-block" />
          <span className="project-card__mockup-block project-card__mockup-block--short" />
        </div>
        <span className="project-card__category">{category}</span>
      </div>
      <div className="project-card__body">
        <div className="project-card__title-row">
          <h3>{name}</h3>
          <ArrowUpRight size={17} aria-hidden="true" />
        </div>
        <p>{description}</p>
        <ul className="project-card__tags" aria-label="Technologies and disciplines">
          {technologies.map((technology) => <li key={technology}>{technology}</li>)}
        </ul>
        <div className="project-card__footer">
          <span className="project-card__sample">Sample concept · not a client project</span>
          <div className="project-card__links">
            {liveUrl && (
              <a href={liveUrl} target="_blank" rel="noreferrer">
                Live demo <ExternalLink size={13} aria-hidden="true" />
              </a>
            )}
            {sourceUrl && (
              <a href={sourceUrl} target="_blank" rel="noreferrer">
                Source <ExternalLink size={13} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ProjectCard

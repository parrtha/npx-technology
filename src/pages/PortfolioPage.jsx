import { useMemo, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import { projectCategories, projects } from '../data/projects.js'

function PortfolioPage() {
  const [category, setCategory] = useState('All')
  const visibleProjects = useMemo(
    () => category === 'All'
      ? projects
      : projects.filter((project) => project.category === category),
    [category],
  )

  return (
    <>
      <Reveal as="section" className="inner-hero inner-hero--portfolio">
        <div className="container inner-hero__content">
          <p className="eyebrow"><span className="eyebrow__dot" /> Selected concepts</p>
          <h1>Ideas, explored<br /><span>through digital.</span></h1>
          <p>
            These sample concepts show the kinds of problems we like to solve.
            They are illustrative work, not client projects or live products.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="section portfolio-section">
        <div className="container">
          <SectionHeading
            eyebrow="Concept gallery"
            title="A few directions we could take."
            description="Filter by category to explore sample website concepts and their possible technology."
          />
          <div className="portfolio-filters" role="group" aria-label="Filter sample projects by category">
            {projectCategories.map((item) => (
              <button
                className={category === item ? 'portfolio-filter is-active' : 'portfolio-filter'}
                type="button"
                key={item}
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
              >
                {item}
              </button>
            ))}
          </div>
          <p className="portfolio-notice" role="status">
            Sample concepts only — no real clients, testimonials, demos, or source repositories are represented here.
          </p>
          <div className="portfolio-grid">
            {visibleProjects.map((project) => <ProjectCard key={project.name} project={project} />)}
          </div>
          <div className="portfolio-cta">
            <p>Have a real project in mind?</p>
            <Link to="/contact">Let&apos;s talk about it <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
      </Reveal>
    </>
  )
}

export default PortfolioPage

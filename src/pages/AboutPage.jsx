import { ArrowUpRight, Compass, HeartHandshake, Lightbulb, ShieldCheck, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../components/Card.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionHeading from '../components/SectionHeading.jsx'

const values = [
  {
    icon: Compass,
    title: 'Clarity first',
    description: 'We make the complex easier to understand, decide, and act on.',
  },
  {
    icon: HeartHandshake,
    title: 'Work together',
    description: 'The best outcomes come from open collaboration and shared context.',
  },
  {
    icon: ShieldCheck,
    title: 'Care in the details',
    description: 'We value accessible, reliable work as much as the first impression.',
  },
  {
    icon: Lightbulb,
    title: 'Stay curious',
    description: 'We keep learning and choose tools for the problem, not the trend.',
  },
]

const founders = [
  { label: 'Founder One', role: '[Add co-founder role]', profile: '[Add an approved founder biography and profile photo.]' },
  { label: 'Founder Two', role: '[Add co-founder role]', profile: '[Add an approved founder biography and profile photo.]' },
]

const approachSteps = [
  { title: 'Listen before recommending', detail: 'Understand the business context, people, and constraints first.' },
  { title: 'Make decisions together', detail: 'Share options and trade-offs so the direction is clear to everyone.' },
  { title: 'Deliver with care', detail: 'Review the details, document the work, and plan a considered handover.' },
]

function AboutPage() {
  return (
    <>
      <Reveal as="section" className="inner-hero inner-hero--about">
        <div className="container inner-hero__content">
          <p className="eyebrow"><span className="eyebrow__dot" /> About NPX</p>
          <h1>Small enough to care.<br /><span>Built to think big.</span></h1>
          <p>
            NPX TECHNOLOGY is a digital development company bringing thoughtful
            design and dependable engineering to ambitious ideas.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="section about-purpose-section">
        <div className="container purpose-grid">
          <Card className="purpose-card">
            <span className="purpose-card__icon"><Target size={20} aria-hidden="true" /></span>
            <p className="eyebrow">Our mission</p>
            <h2>Make useful digital experiences easier to build.</h2>
            <p>We turn business goals into clear, accessible products through close collaboration and considered technology.</p>
          </Card>
          <Card className="purpose-card purpose-card--vision">
            <span className="purpose-card__icon"><Compass size={20} aria-hidden="true" /></span>
            <p className="eyebrow">Our vision</p>
            <h2>A more thoughtful digital world.</h2>
            <p>We want teams of every size to have access to digital work that is useful, dependable, and made with care.</p>
          </Card>
        </div>
      </Reveal>

      <Reveal as="section" className="section about-goals-section" delay={0.03}>
        <div className="container goals-grid">
          <div>
            <SectionHeading
              eyebrow="Our goals"
              title="Good outcomes, by design."
              description="We keep the work grounded in practical goals and the people who depend on the result."
            />
          </div>
          <div className="goal-list">
            <div><span>01</span><p>Build trust through clear scope, honest communication, and reliable delivery.</p></div>
            <div><span>02</span><p>Make accessibility, performance, and maintainability part of the process.</p></div>
            <div><span>03</span><p>Leave teams with a digital foundation they can understand and grow.</p></div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section about-approach-section" delay={0.03}>
        <div className="container">
          <SectionHeading
            eyebrow="Our working approach"
            title="Practical, collaborative, and clear."
            description="We make room for good questions and shared decisions at every stage."
          />
          <div className="about-approach-grid">
            {approachSteps.map((step, index) => (
              <Card className="about-approach-card" key={step.title}>
                <span>0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </Card>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section founder-section" delay={0.03}>
        <div className="container">
          <SectionHeading
            eyebrow="The people behind NPX"
            title="Meet the founders."
            description="Founder profile content is intentionally editable placeholder copy. Replace it with approved names, roles, and biographies before publishing."
            align="center"
          />
          <div className="founder-grid">
            {founders.map((founder, index) => (
              <Card className="founder-card" key={founder.label}>
                <div className={`founder-card__portrait founder-card__portrait--${index + 1}`} aria-hidden="true">
                  <span>{index === 0 ? '01' : '02'}</span>
                </div>
                <div className="founder-card__copy">
                  <span className="founder-card__placeholder">Editable profile placeholder</span>
                  <h3>{founder.label} — edit profile</h3>
                  <p className="founder-card__role">{founder.role}</p>
                  <p>{founder.profile}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section values-section" delay={0.03}>
        <div className="container">
          <SectionHeading
            eyebrow="What guides us"
            title="Values that show up in the work."
            description="A few simple principles help us make better decisions together."
          />
          <div className="values-grid">
            {values.map(({ icon: Icon, title, description }) => (
              <Card className="value-card" key={title}>
                <span><Icon size={20} aria-hidden="true" /></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="about-cta" delay={0.03}>
        <div className="container about-cta__inner">
          <div>
            <p className="eyebrow">A good place to start</p>
            <h2>Let&apos;s talk about what comes next.</h2>
          </div>
          <Link className="button button--light" to="/contact">Talk to the team <ArrowUpRight size={16} /></Link>
        </div>
      </Reveal>
    </>
  )
}

export default AboutPage

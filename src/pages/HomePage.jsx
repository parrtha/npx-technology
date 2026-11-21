import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Code2,
  Compass,
  Handshake,
  Layers3,
  Palette,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
} from 'lucide-react'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import { projects } from '../data/projects.js'
import { services } from '../data/services.js'

const serviceHighlights = [
  {
    icon: Layers3,
    service: services[0],
  },
  {
    icon: Code2,
    service: services[1],
  },
  {
    icon: Workflow,
    service: services[7],
  },
]

const reasons = [
  {
    icon: ScanSearch,
    title: 'We start with understanding',
    description: 'We ask useful questions before choosing a direction or reaching for a tool.',
  },
  {
    icon: Handshake,
    title: 'You work directly with the team',
    description: 'Clear communication keeps decisions visible and the work moving together.',
  },
  {
    icon: ShieldCheck,
    title: 'Built for real-world use',
    description: 'Responsive, accessible foundations help your digital presence work across devices.',
  },
]

const process = [
  { number: '01', icon: Compass, title: 'Discover', description: 'Align on your audience, goals, constraints, and what success should mean.' },
  { number: '02', icon: Target, title: 'Define', description: 'Shape the scope, content structure, technical approach, and delivery plan.' },
  { number: '03', icon: Palette, title: 'Design', description: 'Explore a clear visual direction and useful user journeys before building.' },
  { number: '04', icon: Code2, title: 'Build and hand over', description: 'Develop, review, refine, and prepare the work for a considered launch.' },
]

function HomePage() {
  const reduceMotion = useReducedMotion()

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
          >
            <p className="eyebrow"><span className="eyebrow__dot" /> Digital studio for ambitious teams</p>
            <h1>Make your next<br />digital move <span>matter.</span></h1>
            <p className="hero-copy__description">
              NPX TECHNOLOGY designs and builds digital experiences that make
              complex ideas feel clear, useful, and ready for what&apos;s next.
            </p>
            <div className="hero-actions">
              <Button to="/contact" size="large">
                Start a conversation <ArrowUpRight size={17} aria-hidden="true" />
              </Button>
              <Button to="/work" variant="text" size="large">
                Explore our work <ArrowDownRight size={17} aria-hidden="true" />
              </Button>
            </div>
            <div className="hero-proof">
              <span className="hero-proof__icon"><ShieldCheck size={18} aria-hidden="true" /></span>
              <span>Strategy, design, and engineering in one team</span>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, delay: reduceMotion ? 0 : 0.08, ease: 'easeOut' }}
          >
            <div className="hero-visual__topline">
              <span>THE DIGITAL ADVANTAGE</span>
              <span className="hero-visual__status"><i /> BUILT WITH PURPOSE</span>
            </div>
            <div className="hero-visual__content">
              <div className="hero-visual__orb" aria-hidden="true">
                <span /><span /><span />
                <Sparkles size={27} />
              </div>
              <p className="hero-visual__label">A better kind of digital partner</p>
              <h2>Ideas into<br /><span>impact.</span></h2>
              <p className="hero-visual__caption">
                The right mix of clarity, craft, and technology to move your business forward.
              </p>
            </div>
            <div className="hero-visual__footer">
              <span>DESIGNED TO MOVE YOU FORWARD</span>
              <span>NPX / 01</span>
            </div>
          </motion.div>
        </div>
        <div className="hero-bottom container">
          <span>SCROLL TO DISCOVER</span>
          <div className="hero-bottom__line" />
          <span>01 — 03</span>
        </div>
      </section>

      <section className="section section--services">
        <div className="container">
          <SectionHeading
            eyebrow="What we do"
            title="Digital, made deliberate."
            description="From the first sketch to the final line of code, we bring the right people and the right thinking to every challenge."
          />
          <div className="service-grid">
            {serviceHighlights.map(({ icon: Icon, service }, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, delay: reduceMotion ? 0 : index * 0.06 }}
              >
                <Card className="service-card">
                  <span className="service-card__icon"><Icon size={21} aria-hidden="true" /></span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <span className="service-card__arrow" aria-hidden="true"><ArrowUpRight size={17} /></span>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="section-link-row">
            <span>Built around your needs, never a one-size-fits-all process.</span>
            <Button to="/services" variant="outline" size="small">
              Explore our services <ArrowUpRight size={15} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <section className="section home-intro-section">
        <div className="container home-intro-grid">
          <div className="home-intro-copy">
            <p className="eyebrow">A digital partner with purpose</p>
            <h2>Technology should make the next step <span>feel clearer.</span></h2>
          </div>
          <div className="home-intro-detail">
            <p>
              NPX TECHNOLOGY brings strategy, design, and development together
              to help businesses create a digital presence that works for their
              customers and their team.
            </p>
            <Button to="/about" variant="text">
              More about NPX <ArrowUpRight size={16} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <section className="section section--approach">
        <div className="container approach-grid">
          <div className="approach-intro">
            <p className="eyebrow">Why choose NPX</p>
            <h2>Good work starts with <span>good questions.</span></h2>
            <p>
              A thoughtful partner helps you make confident decisions—not just
              move quickly. We keep the work considered, collaborative, and clear.
            </p>
            <Button to="/about" variant="text">
              How we work <ArrowUpRight size={16} aria-hidden="true" />
            </Button>
          </div>
          <Card className="approach-card">
            <div className="approach-card__heading">
              <span className="approach-card__icon"><ShieldCheck size={20} aria-hidden="true" /></span>
              <span>Why teams choose a considered process</span>
            </div>
            <div className="why-list">
              {reasons.map(({ icon: Icon, title, description }) => (
                <div className="why-list__item" key={title}>
                  <span className="why-list__icon"><Icon size={17} aria-hidden="true" /></span>
                  <div><strong>{title}</strong><p>{description}</p></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="section process-section">
        <div className="container">
          <SectionHeading
            eyebrow="Our working process"
            title="From first question to final handover."
            description="A clear sequence keeps the work focused while leaving room to make better decisions as we learn."
            align="center"
          />
          <div className="process-grid">
            {process.map(({ number, icon: Icon, title, description }) => (
              <Card className="process-card" key={number}>
                <div className="process-card__top">
                  <span className="process-card__icon"><Icon size={19} aria-hidden="true" /></span>
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section featured-work-section">
        <div className="container">
          <div className="featured-work-heading">
            <SectionHeading
              eyebrow="Featured concepts"
              title="Ideas, explored through digital."
              description="A few clearly labelled sample concepts—not real client engagements."
            />
            <Button to="/work" variant="outline" size="small">
              View all concepts <ArrowUpRight size={15} aria-hidden="true" />
            </Button>
          </div>
          <div className="featured-work-grid">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="section testimonials-section">
        <div className="container testimonials-grid">
          <div>
            <p className="eyebrow">Client feedback</p>
            <h2>Trust is earned in the work.</h2>
            <p>
              We will share client feedback here only when there are verified,
              approved testimonials to publish.
            </p>
          </div>
          <Card className="testimonial-empty">
            <span className="testimonial-empty__icon"><ShieldCheck size={21} aria-hidden="true" /></span>
            <div>
              <strong>No testimonials published yet</strong>
              <p>This space is reserved for genuine client feedback, shared with permission.</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="closing-section">
        <div className="container closing-card">
          <div>
            <p className="eyebrow">Have a good one in mind?</p>
            <h2>Let&apos;s make it<br />real together.</h2>
          </div>
          <Button to="/contact" variant="light" size="large">
            Tell us about it <ArrowUpRight size={17} aria-hidden="true" />
          </Button>
        </div>
      </section>
    </>
  )
}

export default HomePage

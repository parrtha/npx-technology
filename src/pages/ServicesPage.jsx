import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../components/Card.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import { engagementOptions, services } from '../data/services.js'

function ServicesPage() {
  const reduceMotion = useReducedMotion()

  return (
    <>
      <Reveal as="section" className="inner-hero">
        <div className="container inner-hero__content">
          <p className="eyebrow"><span className="eyebrow__dot" /> Our services</p>
          <h1>Digital services,<br /><span>thoughtfully delivered.</span></h1>
          <p>
            From a focused landing page to a custom web application, get the right
            expertise for the problem you need to solve.
          </p>
          <Link className="text-link" to="/contact">Talk through your project <ArrowRight size={16} /></Link>
        </div>
      </Reveal>

      <Reveal as="section" className="section services-detail-section">
        <div className="container">
          <SectionHeading
            eyebrow="What we can build"
            title="One partner, the right solution."
            description="Every engagement starts with understanding your audience, goals, and constraints. The work is shaped around that—not a fixed template."
          />
          <div className="services-detail-grid">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : (index % 2) * 0.05 }}
              >
                <Card className="service-detail-card">
                  <span className="service-detail-card__number">{String(index + 1).padStart(2, '0')}</span>
                  <h2>{service.title}</h2>
                  <p>{service.description}</p>
                  <ul>
                    {service.benefits.map((benefit) => (
                      <li key={benefit}><Check size={15} aria-hidden="true" />{benefit}</li>
                    ))}
                  </ul>
                  <Link to={`/contact?service=${encodeURIComponent(service.title)}`}>
                    Discuss this service <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section services-showcase-section" delay={0.02}>
        <div className="container services-showcase-grid">
          <div className="services-showcase-copy">
            <p className="eyebrow">Designed for real devices</p>
            <h2>One considered experience, <span>wherever it lives.</span></h2>
            <p>
              Good responsive design does more than shrink a desktop layout.
              We shape content, hierarchy, and interactions to feel natural on
              every screen size.
            </p>
            <ul>
              <li><Check size={15} aria-hidden="true" />Flexible content and layout</li>
              <li><Check size={15} aria-hidden="true" />Touch-friendly interactions</li>
              <li><Check size={15} aria-hidden="true" />Readable visual hierarchy</li>
            </ul>
            <Link to="/contact">Discuss a responsive project <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>

          <div className="services-showcase-art" aria-hidden="true">
            <span className="services-showcase-art__glow" />
            <div className="services-device services-device--desktop">
              <div className="services-device__screen">
                <div className="services-device__toolbar"><i /><i /><i /><span /></div>
                <div className="services-device__canvas">
                  <span className="services-device__kicker" />
                  <span className="services-device__headline" />
                  <span className="services-device__copy" />
                  <span className="services-device__action" />
                  <span className="services-device__panel" />
                </div>
              </div>
              <span className="services-device__stand" />
            </div>
            <div className="services-device services-device--phone">
              <div className="services-device__screen">
                <span className="services-device__notch" />
                <span className="services-device__phone-heading" />
                <span className="services-device__phone-panel" />
                <span className="services-device__phone-copy" />
                <span className="services-device__phone-action" />
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section pricing-section" delay={0.03}>
        <div className="container">
          <SectionHeading
            eyebrow="Pricing approach"
            title="A clear scope before a number."
            description="We quote each project after understanding its goals and requirements. These engagement types are starting points, not fixed-price offers."
            align="center"
          />
          <div className="pricing-grid">
            {engagementOptions.map((option) => (
              <Card
                className={`pricing-card${option.featured ? ' pricing-card--featured' : ''}`}
                key={option.name}
              >
                {option.featured && <span className="pricing-card__badge">Balanced scope</span>}
                <p className="pricing-card__name">{option.name}</p>
                <p className="pricing-card__price">Custom quote</p>
                <p className="pricing-card__summary">{option.summary}</p>
                <ul>
                  {option.scope.map((item) => (
                    <li key={item}><Check size={15} aria-hidden="true" />{item}</li>
                  ))}
                </ul>
                <Link to="/contact">Discuss your scope <ArrowRight size={15} aria-hidden="true" /></Link>
              </Card>
            ))}
          </div>
          <p className="pricing-disclaimer">No fixed prices are shown because scope, content, and integrations vary by project.</p>
        </div>
      </Reveal>
    </>
  )
}

export default ServicesPage

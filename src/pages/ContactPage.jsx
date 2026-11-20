import { useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Mail, MessageCircle, ShieldCheck } from 'lucide-react'
import Card from '../components/Card.jsx'
import ContactForm from '../components/ContactForm.jsx'
import SectionHeading from '../components/SectionHeading.jsx'

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim()
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null

function ContactPage() {
  const [searchParams] = useSearchParams()
  const requestedService = searchParams.get('service') ?? ''

  return (
    <>
      <section className="inner-hero inner-hero--contact">
        <div className="container inner-hero__content">
          <p className="eyebrow"><span className="eyebrow__dot" /> Contact</p>
          <h1>Tell us what you<br /><span>want to make.</span></h1>
          <p>
            Share a little about your goals. The enquiry form currently validates
            details locally; it does not send or store them.
          </p>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container contact-grid">
          <div className="contact-form-column">
            <SectionHeading
              eyebrow="Project enquiry"
              title="Start with the basics."
              description="A few details help frame a useful first conversation."
            />
            <ContactForm key={requestedService} initialService={requestedService} />
          </div>

          <aside className="contact-sidebar" aria-label="Contact details">
            <Card className="contact-info-card">
              <p className="eyebrow">Contact details</p>
              <h2>Get in touch with NPX.</h2>
              <p className="contact-info-card__description">
                Verified contact channels will be listed here once configured.
              </p>
              <div className="contact-detail">
                <span><Mail size={18} aria-hidden="true" /></span>
                <div>
                  <strong>Email</strong>
                  {contactEmail
                    ? <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                    : <p>Contact email not configured</p>}
                </div>
              </div>
              <div className="contact-detail">
                <span><MessageCircle size={18} aria-hidden="true" /></span>
                <div>
                  <strong>WhatsApp</strong>
                  {whatsappUrl
                    ? (
                      <a href={whatsappUrl} target="_blank" rel="noreferrer">
                        Message NPX <ArrowUpRight size={13} aria-hidden="true" />
                      </a>
                    )
                    : <p>WhatsApp contact not configured</p>}
                </div>
              </div>
            </Card>

            <Card className="contact-privacy-card">
              <span><ShieldCheck size={19} aria-hidden="true" /></span>
              <div>
                <h3>Privacy by default</h3>
                <p>No form data is transmitted or stored in this preview. Backend delivery must be connected before enquiries can be submitted.</p>
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </>
  )
}

export default ContactPage

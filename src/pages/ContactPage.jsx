import { useSearchParams } from 'react-router-dom'
import { Mail, ShieldCheck } from 'lucide-react'
import Card from '../components/Card.jsx'
import ContactForm from '../components/ContactForm.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import WhatsAppIcon from '../components/WhatsAppIcon.jsx'
import { contactEmail, contactEmailUrl, whatsappUrl } from '../utils/contactLinks.js'

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
                Choose the contact method that works best for you.
              </p>
              <div className="contact-actions" role="group" aria-label="Contact NPX">
                {whatsappUrl && (
                  <a
                    className="contact-action contact-action--whatsapp"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon size={19} />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}
                {contactEmailUrl && (
                  <a className="contact-action contact-action--email" href={contactEmailUrl}>
                    <Mail size={18} aria-hidden="true" />
                    <span>Email us</span>
                    <small>{contactEmail}</small>
                  </a>
                )}
                {!whatsappUrl && !contactEmailUrl && (
                  <p className="contact-actions__empty">
                    Direct contact options are not configured. Please use the enquiry form.
                  </p>
                )}
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

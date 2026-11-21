import { useSearchParams } from 'react-router-dom'
import { Mail, ShieldCheck } from 'lucide-react'
import Card from '../components/Card.jsx'
import ContactForm from '../components/ContactForm.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import WhatsAppIcon from '../components/WhatsAppIcon.jsx'
import usePublishedWebsiteThemes from '../hooks/usePublishedWebsiteThemes.js'
import { useAuth } from '../hooks/useAuth.js'
import { createWebsiteEnquiry } from '../lib/websiteThemes.js'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js'
import { contactEmail, contactEmailUrl, whatsappUrl } from '../utils/contactLinks.js'

function ContactPage() {
  const [searchParams] = useSearchParams()
  const requestedService = searchParams.get('service') ?? ''
  const requestedThemeSlug = searchParams.get('theme') ?? ''
  const { session, loading: authLoading } = useAuth()
  const themeCatalog = usePublishedWebsiteThemes()
  const requestedTheme = themeCatalog.themes.find((theme) => theme.slug === requestedThemeSlug)

  async function submitEnquiry(enquiry) {
    if (authLoading) {
      throw new Error('Your account session is still loading. Please try submitting again in a moment.')
    }
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Enquiry delivery is unavailable.')
    }
    const client = await getSupabaseClient()
    if (!client) {
      throw new Error('Supabase is not configured. Enquiry delivery is unavailable.')
    }
    await createWebsiteEnquiry(client, enquiry, session?.user?.id ?? null)
  }

  return (
    <>
      <Reveal as="section" className="inner-hero inner-hero--contact">
        <div className="container inner-hero__content">
          <p className="eyebrow"><span className="eyebrow__dot" /> Contact</p>
          <h1>Tell us what you<br /><span>want to make.</span></h1>
          <p>
            Share your goals, business context, and an optional website direction.
            Enquiries are sent to Supabase when its client and required database policies are configured.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="section contact-section">
        <div className="container contact-grid">
          <div className="contact-form-column">
            <SectionHeading
              eyebrow="Project enquiry"
              title="Start with the basics."
              description="A few details help frame a useful first conversation."
            />
              {requestedThemeSlug && themeCatalog.status === 'success' && !requestedTheme && (
                <p className="form-feedback form-feedback--notice" role="status">
                  The selected theme is no longer published. You can still send an enquiry without it.
                </p>
              )}
              <ContactForm
                key={`${requestedService}:${requestedThemeSlug}`}
                initialService={requestedService}
                initialThemeId={requestedTheme?.id ?? ''}
                themes={themeCatalog.themes}
                themeCatalogStatus={themeCatalog.status}
                onSubmit={submitEnquiry}
              />
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
                <p>The form sends only permitted enquiry fields to Supabase. After the required migrations are applied, Row Level Security controls who can read and manage submitted records.</p>
              </div>
            </Card>
          </aside>
        </div>
      </Reveal>
    </>
  )
}

export default ContactPage

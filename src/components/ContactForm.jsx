import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { services } from '../data/services.js'
import Button from './Button.jsx'
import Loading from './Loading.jsx'

function ContactForm({ initialService = '', onSubmit }) {
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    const form = event.currentTarget

    if (!form.reportValidity()) {
      setStatus('invalid')
      return
    }

    const formData = new FormData(form)
    const enquiry = Object.fromEntries(formData.entries())

    if (!onSubmit) {
      setStatus('ready')
      return
    }

    setStatus('loading')

    try {
      await onSubmit(enquiry)
      setStatus('success')
      form.reset()
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Your enquiry could not be sent. Please try again later.',
      )
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__grid">
        <label className="form-field">
          <span>Name <span aria-hidden="true">*</span></span>
          <input autoComplete="name" name="name" required maxLength={100} />
        </label>
        <label className="form-field">
          <span>Email <span aria-hidden="true">*</span></span>
          <input autoComplete="email" name="email" type="email" required maxLength={254} />
        </label>
        <label className="form-field">
          <span>Phone <span className="form-field__optional">(optional)</span></span>
          <input
            autoComplete="tel"
            name="phone"
            type="tel"
            maxLength={40}
            pattern="[0-9+().\-\s]{7,40}"
            title="Enter a phone number using digits, spaces, and common phone symbols."
          />
        </label>
        <label className="form-field">
          <span>Service <span aria-hidden="true">*</span></span>
          <select name="service" required defaultValue={initialService}>
            <option value="" disabled>Select a service</option>
            {services.map((service) => (
              <option key={service.title} value={service.title}>{service.title}</option>
            ))}
          </select>
        </label>
        <label className="form-field form-field--wide">
          <span>Tell us a little about your project <span aria-hidden="true">*</span></span>
          <textarea
            name="message"
            required
            minLength={20}
            maxLength={3000}
            rows={5}
            placeholder="What are you hoping to create or improve?"
          />
          <span className="form-field__hint">At least 20 characters. Please do not include sensitive information.</span>
        </label>
      </div>

      <div className="contact-form__submit-row">
        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading'
            ? 'Sending enquiry'
            : onSubmit ? 'Send enquiry' : 'Validate enquiry'}
          {status !== 'loading' && <ArrowRight size={16} aria-hidden="true" />}
        </Button>
        <span className="contact-form__required-note">* Required fields</span>
      </div>

      <div className="contact-form__feedback" aria-live="polite">
        {status === 'loading' && <Loading label="Sending your enquiry" />}
        {status === 'ready' && (
          <p className="form-feedback form-feedback--notice">
            <CheckCircle2 size={17} aria-hidden="true" />
            Your details passed validation. Nothing has been sent; enquiry delivery is not connected yet.
          </p>
        )}
        {status === 'success' && (
          <p className="form-feedback form-feedback--success" role="status">
            <CheckCircle2 size={17} aria-hidden="true" />
            Your enquiry was received.
          </p>
        )}
        {status === 'invalid' && (
          <p className="form-feedback form-feedback--error" role="alert">
            Please check the highlighted fields and try again.
          </p>
        )}
        {status === 'error' && (
          <p className="form-feedback form-feedback--error" role="alert">{errorMessage}</p>
        )}
      </div>

      <p className="contact-form__privacy">
        This form is not connected to a backend yet. Your details are not transmitted or stored.
      </p>
    </form>
  )
}

export default ContactForm

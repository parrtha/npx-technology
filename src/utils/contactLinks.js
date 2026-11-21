const configuredEmail = (import.meta.env.VITE_CONTACT_EMAIL ?? '').trim()
const configuredWhatsAppNumber = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
const emailIsValid = emailPattern.test(configuredEmail)

export const contactEmail = emailIsValid ? configuredEmail : ''
export const contactEmailUrl = contactEmail ? `mailto:${contactEmail}` : ''

const phoneNumberFormatIsValid = /^\+?[\d\s().-]+$/.test(configuredWhatsAppNumber.trim())
const whatsappNumber = configuredWhatsAppNumber.replace(/\D/g, '')
const whatsappNumberIsValid = phoneNumberFormatIsValid
  && whatsappNumber.length >= 7
  && whatsappNumber.length <= 15
  && !whatsappNumber.startsWith('0')

export const whatsappUrl = whatsappNumberIsValid
  ? `https://wa.me/${whatsappNumber}`
  : ''

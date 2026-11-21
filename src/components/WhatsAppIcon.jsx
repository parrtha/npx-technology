import { MessageCircle, Phone } from 'lucide-react'

function WhatsAppIcon({ size = 20 }) {
  return (
    <span className="whatsapp-icon" aria-hidden="true" style={{ width: size, height: size }}>
      <MessageCircle size={size} strokeWidth={2} />
      <Phone className="whatsapp-icon__phone" size={size * 0.48} strokeWidth={2.8} />
    </span>
  )
}

export default WhatsAppIcon

import { Mail, ShieldCheck, UserRound } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Card from '../components/Card.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import { useAuth } from '../hooks/useAuth.js'

function CustomerProfilePage() {
  const { profile, user } = useAuth()
  const reduceMotion = useReducedMotion()
  const fullName = profile?.full_name?.trim() || 'Not provided'
  const accountEmail = user?.email || 'Not available'
  const role = profile?.role === 'customer' ? 'Customer' : 'Unavailable'

  return (
    <motion.div
      className="customer-profile-page"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.32, ease: 'easeOut' }}
    >
      <SectionHeading
        eyebrow="Account"
        title="Your profile"
        description="Review the account details currently associated with your NPX workspace."
        className="workspace-page__heading"
      />

      <Card className="customer-profile-card">
        <div className="customer-profile-card__identity">
          <span className="customer-profile-card__avatar"><UserRound size={23} aria-hidden="true" /></span>
          <div>
            <h2>{fullName}</h2>
            <p>Customer account</p>
          </div>
        </div>

        <dl className="customer-profile-details">
          <div>
            <dt><UserRound size={16} aria-hidden="true" /> Full name</dt>
            <dd>{fullName}</dd>
          </div>
          <div>
            <dt><Mail size={16} aria-hidden="true" /> Email address</dt>
            <dd>{accountEmail}</dd>
          </div>
          <div>
            <dt><ShieldCheck size={16} aria-hidden="true" /> Account role</dt>
            <dd>{role}</dd>
          </div>
        </dl>
      </Card>
      <p className="customer-profile-page__note">Profile editing is not connected yet. These details are read-only.</p>
    </motion.div>
  )
}

export default CustomerProfilePage

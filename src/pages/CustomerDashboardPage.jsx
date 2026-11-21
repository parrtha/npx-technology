import {
  Activity,
  ArrowRight,
  Bell,
  CircleCheck,
  CreditCard,
  FileText,
  FolderKanban,
  MessageCircle,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import Card from '../components/Card.jsx'
import { useAuth } from '../hooks/useAuth.js'

const summaryCards = [
  { label: 'Total Projects', icon: FolderKanban, note: 'Project data is not connected yet.' },
  { label: 'Active Projects', icon: Activity, note: 'Project data is not connected yet.' },
  { label: 'Completed Projects', icon: CircleCheck, note: 'Project data is not connected yet.' },
  { label: 'Pending Payments', icon: CreditCard, note: 'Payment data is not connected yet.' },
]

function CustomerDashboardPage() {
  const { profile } = useAuth()
  const reduceMotion = useReducedMotion()
  const firstName = profile?.full_name?.trim().split(/\s+/)[0]

  return (
    <motion.div
      className="customer-dashboard"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.32, ease: 'easeOut' }}
    >
      <header className="customer-dashboard__welcome">
        <div>
          <p className="eyebrow"><span className="eyebrow__dot" /> Customer workspace</p>
          <h1>{firstName ? `Welcome back, ${firstName}` : 'Welcome to your workspace'}</h1>
          <p className="customer-dashboard__description">
            Your projects and account updates will appear here when workspace data is connected.
          </p>
        </div>
        <span className="customer-dashboard__status">
          <span aria-hidden="true" />
          Data integration pending
        </span>
      </header>

      <section className="customer-stats" aria-label="Account overview">
        {summaryCards.map(({ label, icon: Icon, note }) => (
          <Card className="customer-stat" key={label}>
            <div className="customer-stat__top">
              <span>{label}</span>
              <span className="customer-stat__icon"><Icon size={18} aria-hidden="true" /></span>
            </div>
            <p className="customer-stat__value" aria-label={`${label}: not available`}>—</p>
            <p className="customer-stat__note">{note}</p>
          </Card>
        ))}
      </section>

      <div className="customer-dashboard__panels">
        <Card className="customer-panel">
          <div className="customer-panel__header">
            <div>
              <p className="customer-panel__eyebrow">Your work</p>
              <h2>Recent projects</h2>
            </div>
            <Link className="customer-panel__link" to="/dashboard/projects">
              View all <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="customer-panel__empty" role="status">
            <span className="customer-panel__empty-icon"><FolderKanban size={20} aria-hidden="true" /></span>
            <h3>Project updates will appear here</h3>
            <p>Project data integration is pending. No project records are displayed or simulated.</p>
          </div>
        </Card>

        <Card className="customer-panel">
          <div className="customer-panel__header">
            <div>
              <p className="customer-panel__eyebrow">Stay up to date</p>
              <h2>Recent notifications</h2>
            </div>
            <Link className="customer-panel__link" to="/dashboard/notifications">
              View all <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="customer-panel__empty" role="status">
            <span className="customer-panel__empty-icon"><Bell size={20} aria-hidden="true" /></span>
            <h3>Updates will appear here</h3>
            <p>Notification data integration is pending. No notifications are displayed or simulated.</p>
          </div>
        </Card>
      </div>

      <Card className="customer-quick-actions">
        <div>
          <p className="customer-panel__eyebrow">Need a hand?</p>
          <h2>Quick actions</h2>
          <p>Go to your project area or get in touch with the NPX team.</p>
        </div>
        <div className="customer-quick-actions__links">
          <Link className="button button--primary" to="/dashboard/projects">
            <FolderKanban size={17} aria-hidden="true" /> View Projects
          </Link>
          <Link className="button button--outline" to="/dashboard/enquiries">
            <FileText size={17} aria-hidden="true" /> My Enquiries
          </Link>
          <Link className="button button--outline" to="/contact">
            <MessageCircle size={17} aria-hidden="true" /> Contact Support
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}

export default CustomerDashboardPage

import { useAuth } from '../hooks/useAuth.js'
import { motion, useReducedMotion } from 'motion/react'
import { AtSign, BadgeCheck, UserRound } from 'lucide-react'
import Card from '../components/Card.jsx'

function AdminSettingsPage() {
  const { profile, user } = useAuth()
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="admin-settings-page"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: 'easeOut' }}
    >
      <header className="admin-page-heading">
        <p className="eyebrow"><span className="eyebrow__dot" /> Workspace preferences</p>
        <h1>Settings</h1>
        <p>Review the signed-in administrator account and workspace preferences.</p>
      </header>

      <Card className="admin-settings-card">
        <div className="admin-settings-card__heading">
          <span className="admin-settings-card__icon"><UserRound size={20} aria-hidden="true" /></span>
          <div>
            <h2>Administrator profile</h2>
            <p>Account details from your authenticated NPX profile.</p>
          </div>
          <span className="admin-role-badge"><BadgeCheck size={15} aria-hidden="true" /> Admin</span>
        </div>

        <div className="admin-settings-fields">
          <label>
            <span>Full name</span>
            <span className="admin-settings-field">
              <UserRound size={16} aria-hidden="true" />
              <input value={profile?.full_name ?? ''} readOnly aria-label="Administrator full name" />
            </span>
          </label>
          <label>
            <span>Email address</span>
            <span className="admin-settings-field">
              <AtSign size={16} aria-hidden="true" />
              <input value={user?.email ?? ''} readOnly aria-label="Administrator email address" />
            </span>
          </label>
        </div>

        <p className="admin-settings-note" role="status">
          Profile editing and workspace preferences are not connected in this preview.
        </p>
      </Card>
    </motion.div>
  )
}

export default AdminSettingsPage

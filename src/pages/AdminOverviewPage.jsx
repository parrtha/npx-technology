import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  CircleCheck,
  CreditCard,
  FileText,
  RotateCw,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import Card from '../components/Card.jsx'
import Skeleton from '../components/Skeleton.jsx'
import { useAuth } from '../hooks/useAuth.js'
import {
  createAdminOverviewRequestKey,
  fetchAdminOverviewData,
} from '../lib/adminOverviewData.js'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js'

const overviewMetrics = [
  { label: 'Total enquiries', key: 'totalEnquiries', icon: FileText, tone: 'blue' },
  { label: 'Total customers', key: 'totalCustomers', icon: Users, tone: 'cyan' },
  { label: 'Active projects', key: 'activeProjects', icon: BriefcaseBusiness, tone: 'violet' },
  { label: 'Completed projects', key: 'completedProjects', icon: CircleCheck, tone: 'green' },
  { label: 'Pending payments', key: 'pendingPayments', icon: CreditCard, tone: 'amber' },
]

const enquiryStatuses = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  closed: 'Closed',
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function AdminPanelState({ icon: Icon, title, description, loading = false }) {
  return (
    <div className="admin-empty" role="status">
      <div className="admin-empty__illustration" aria-hidden="true">
        <span className="admin-empty__orbit admin-empty__orbit--outer" />
        <span className="admin-empty__orbit admin-empty__orbit--inner" />
        <span className="admin-empty__node admin-empty__node--top" />
        <span className="admin-empty__node admin-empty__node--side" />
        <span className="admin-empty__glyph"><Icon size={21} /></span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {loading && <span className="sr-only">Loading</span>}
    </div>
  )
}

function AdminOverviewPage() {
  const { profile, session, loading: authLoading } = useAuth()
  const [requestResult, setRequestResult] = useState(null)
  const [retryVersion, setRetryVersion] = useState(0)
  const reduceMotion = useReducedMotion()
  const firstName = profile?.full_name?.trim().split(/\s+/)[0]
  const userId = session?.user?.id ?? null
  const role = profile?.role ?? null
  const canRead = Boolean(session?.access_token && role === 'admin')
  const requestKey = useMemo(
    () => createAdminOverviewRequestKey(userId, role, retryVersion),
    [retryVersion, role, userId],
  )
  const currentResult = requestResult?.key === requestKey ? requestResult : null

  useEffect(() => {
    if (authLoading || !canRead) {
      return undefined
    }

    let isCurrent = true

    async function loadOverview() {
      try {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured.')
        }

        const supabase = await getSupabaseClient()
        if (!isCurrent) {
          return
        }
        if (!supabase) {
          throw new Error('Supabase is not configured.')
        }

        const data = await fetchAdminOverviewData(supabase)
        if (isCurrent) {
          setRequestResult({ key: requestKey, status: 'success', data })
        }
      } catch {
        if (isCurrent) {
          setRequestResult({ key: requestKey, status: 'error', data: null })
        }
      }
    }

    void loadOverview()
    return () => {
      isCurrent = false
    }
  }, [authLoading, canRead, requestKey])

  const overview = currentResult?.data ?? null
  const isLoading = authLoading || (canRead && !currentResult)
  const hasError = !authLoading && (!canRead || currentResult?.status === 'error')
  const requestState = isLoading ? 'loading' : hasError ? 'error' : 'success'
  const statusLabel = isLoading
    ? 'Loading business data'
    : hasError
      ? 'Data unavailable'
      : 'Supabase data connected'

  function retryLoad() {
    setRetryVersion((version) => version + 1)
  }

  function renderEnquiries() {
    if (isLoading) {
      return (
        <AdminPanelState
          icon={FileText}
          title="Loading recent enquiries"
          description="Fetching the latest enquiry records."
          loading
        />
      )
    }
    if (hasError) {
      return (
        <AdminPanelState
          icon={FileText}
          title="Enquiries could not be loaded"
          description="Retry the overview request to try again."
        />
      )
    }
    if (overview.recentEnquiries.length === 0) {
      return (
        <AdminPanelState
          icon={FileText}
          title="No enquiries yet"
          description="New enquiry records will appear here."
        />
      )
    }

    return (
      <ul className="admin-recent-list">
        {overview.recentEnquiries.map((enquiry) => (
          <li className="admin-recent-list__item" key={enquiry.id}>
            <span className="admin-recent-list__avatar" aria-hidden="true">
              {enquiry.name?.trim().charAt(0).toUpperCase() || <Users size={16} />}
            </span>
            <span className="admin-recent-list__details">
              <strong>{enquiry.name}</strong>
              <span>{enquiry.email}</span>
              <small>{enquiry.service || 'Service not specified'}</small>
            </span>
            <span className={`admin-status admin-status--${enquiryStatuses[enquiry.status] ? enquiry.status : 'unknown'}`}>
              {enquiryStatuses[enquiry.status] ?? 'Unknown'}
            </span>
            <time className="admin-recent-list__date" dateTime={enquiry.created_at}>
              {formatDate(enquiry.created_at)}
            </time>
          </li>
        ))}
      </ul>
    )
  }

  function renderActivities() {
    if (isLoading) {
      return (
        <AdminPanelState
          icon={Activity}
          title="Loading recent activity"
          description="Fetching the latest activity log entries."
          loading
        />
      )
    }
    if (hasError) {
      return (
        <AdminPanelState
          icon={Activity}
          title="Activity could not be loaded"
          description="Retry the overview request to try again."
        />
      )
    }
    if (overview.recentActivities.length === 0) {
      return (
        <AdminPanelState
          icon={Activity}
          title="No recent activity"
          description="Recorded workspace activity will appear here."
        />
      )
    }

    return (
      <ul className="admin-recent-list admin-recent-list--activity">
        {overview.recentActivities.map((activity) => (
          <li className="admin-recent-list__item" key={activity.id}>
            <span className="admin-recent-list__avatar admin-recent-list__avatar--activity" aria-hidden="true">
              <Activity size={16} />
            </span>
            <span className="admin-recent-list__details">
              <strong>{activity.action}</strong>
              <span>{activity.entity_type}</span>
            </span>
            <time className="admin-recent-list__date" dateTime={activity.created_at}>
              {formatDate(activity.created_at)}
            </time>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <motion.div
      className="admin-dashboard"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.32, ease: 'easeOut' }}
      aria-busy={isLoading}
    >
      <header className="admin-page-heading admin-dashboard__welcome">
        <div>
          <p className="eyebrow"><span className="eyebrow__dot" /> Administration</p>
          <h1>{firstName ? `Welcome back, ${firstName}` : 'Operations overview'}</h1>
          <p>Keep an eye on enquiries, customer work, and business activity across NPX.</p>
        </div>
        <span className={`admin-data-status admin-data-status--${requestState}`} role="status">
          <span aria-hidden="true" />
          {statusLabel}
        </span>
      </header>

      {hasError && (
        <div className="admin-overview-error" role="alert">
          <div>
            <strong>We couldn’t load the admin overview.</strong>
            <p>
              {canRead
                ? 'Check your administrator session and database setup, then try again.'
                : 'Administrator access is required to view this data.'}
            </p>
          </div>
          <button className="button button--outline" type="button" onClick={retryLoad}>
            <RotateCw size={15} aria-hidden="true" /> Retry
          </button>
        </div>
      )}

      <section className="admin-metrics" aria-label="Business overview">
        {overviewMetrics.map(({ label, key, icon: Icon, tone }) => {
          const value = isLoading ? '…' : overview?.[key]?.toLocaleString() ?? '—'
          return (
            <Card className={`admin-metric admin-metric--${tone}`} key={label}>
              <div className="admin-metric__top">
                <span>{label}</span>
                <span className="admin-metric__icon"><Icon size={18} aria-hidden="true" /></span>
              </div>
              <motion.p
                key={isLoading ? 'loading' : value}
                className="admin-metric__value"
                aria-label={`${label}: ${isLoading ? 'Loading' : value}`}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
              >
                {isLoading ? <Skeleton className="admin-metric__skeleton" /> : value}
              </motion.p>
              <p className="admin-metric__note">
                {hasError ? 'Count unavailable' : isLoading ? 'Loading count…' : 'Current database count'}
              </p>
            </Card>
          )
        })}
      </section>

      <div className="admin-overview-panels">
        <Card className="admin-panel admin-panel--enquiries">
          <div className="admin-panel__header">
            <div>
              <p className="admin-panel__eyebrow">Incoming work</p>
              <h2>Recent enquiries</h2>
            </div>
            <Link className="admin-panel__link" to="/admin/enquiries">
              View enquiries <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {renderEnquiries()}
        </Card>

        <Card className="admin-panel admin-panel--activity">
          <div className="admin-panel__header">
            <div>
              <p className="admin-panel__eyebrow">Workspace timeline</p>
              <h2>Recent activities</h2>
            </div>
            <Link className="admin-panel__link" to="/admin/notifications">
              Notifications <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {renderActivities()}
        </Card>
      </div>

      <Card className="admin-overview-note">
        <span className="admin-overview-note__icon"><ShieldCheck size={18} aria-hidden="true" /></span>
        <div>
          <strong>Administrator data access</strong>
          <p>These reads use the signed-in Supabase client and remain subject to the database’s Row Level Security policies.</p>
        </div>
      </Card>
    </motion.div>
  )
}

export default AdminOverviewPage

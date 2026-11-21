import { useEffect, useState } from 'react'
import { FileText, RotateCw, Sparkles } from 'lucide-react'
import Card from '../components/Card.jsx'
import WebsiteThemePreview from '../components/WebsiteThemePreview.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js'
import { getWebsiteThemeErrorMessage } from '../lib/websiteThemes.js'

const enquiryStatuses = {
  new: 'Received',
  contacted: 'In progress',
  qualified: 'Qualified',
  closed: 'Closed',
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(date)
}

function CustomerEnquiriesPage() {
  const { session, profile, loading: authLoading } = useAuth()
  const userId = session?.user?.id ?? null
  const canRead = Boolean(userId && profile?.role === 'customer')
  const [enquiries, setEnquiries] = useState([])
  const [requestStatus, setRequestStatus] = useState('loading')
  const [resultUserId, setResultUserId] = useState(null)
  const [error, setError] = useState('')
  const [retryVersion, setRetryVersion] = useState(0)

  useEffect(() => {
    if (authLoading || !canRead) {
      return undefined
    }

    let active = true
    async function loadEnquiries() {
      try {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured.')
        }
        const client = await getSupabaseClient()
        if (!client) {
          throw new Error('Supabase is not configured.')
        }

        const result = await client
          .from('enquiries')
          .select([
            'id',
            'service',
            'message',
            'status',
            'created_at',
            'business_name',
            'website_type',
            'selected_theme_id',
            'selected_theme_name',
            'selected_theme_category',
            'selected_theme_colors',
            'selected_theme_preview_path',
          ].join(', '))
          .eq('profile_id', userId)
          .order('created_at', { ascending: false })

        if (result.error) {
          throw new Error(getWebsiteThemeErrorMessage(result.error, 'Supabase could not load enquiry history.'))
        }
        if (!Array.isArray(result.data)) {
          throw new Error('Supabase did not return valid enquiry history.')
        }
        if (active) {
          setEnquiries(result.data)
          setResultUserId(userId)
          setRequestStatus('success')
        }
      } catch (requestError) {
        if (active) {
          setError(getWebsiteThemeErrorMessage(requestError, 'Enquiry history could not be loaded.'))
          setRequestStatus('error')
        }
      }
    }

    void loadEnquiries()
    return () => {
      active = false
    }
  }, [authLoading, canRead, retryVersion, userId])

  const status = authLoading
    ? 'loading'
    : canRead
      ? resultUserId === userId ? requestStatus : 'loading'
      : 'error'
  const visibleEnquiries = resultUserId === userId ? enquiries : []
  const visibleError = canRead
    ? error
    : 'Customer access is required to view enquiry history.'

  function retry() {
    setError('')
    setRequestStatus('loading')
    setRetryVersion((version) => version + 1)
  }

  return (
    <div className="customer-enquiries-page">
      <header className="admin-page-heading customer-enquiries-page__heading">
        <div>
          <p className="eyebrow"><span className="eyebrow__dot" /> Your workspace</p>
          <h1>My enquiries</h1>
          <p>Review the enquiries connected to your account and the website direction you selected.</p>
        </div>
        <span className="customer-enquiries-page__access-note">
          <FileText size={16} aria-hidden="true" /> Your records only
        </span>
      </header>

      {status === 'loading' && (
        <div className="customer-enquiry-state" role="status">
          <span className="admin-theme-state__pulse" />
          <strong>Loading your enquiry history</strong>
          <p>Retrieving records linked to your signed-in account.</p>
        </div>
      )}
      {status === 'error' && (
        <div className="customer-enquiry-state customer-enquiry-state--error" role="alert">
          <strong>Your enquiry history could not be loaded.</strong>
          <p>{visibleError} If the migration has just been applied, sign in again and retry.</p>
          <button
            className="button button--outline"
            type="button"
            onClick={retry}
          >
            <RotateCw size={15} aria-hidden="true" /> Try again
          </button>
        </div>
      )}
      {status === 'success' && visibleEnquiries.length === 0 && (
        <div className="customer-enquiry-state">
          <span className="customer-enquiry-state__icon"><FileText size={21} aria-hidden="true" /></span>
          <strong>No enquiries are linked to your account yet.</strong>
          <p>When you submit an enquiry while signed in, it will appear here.</p>
        </div>
      )}
      {status === 'success' && visibleEnquiries.length > 0 && (
        <div className="customer-enquiries-list">
          {visibleEnquiries.map((enquiry) => {
            const theme = enquiry.selected_theme_name
              ? {
                name: enquiry.selected_theme_name,
                category: enquiry.selected_theme_category,
                colors: enquiry.selected_theme_colors,
                preview_image_path: enquiry.selected_theme_preview_path,
              }
              : null
            const statusName = enquiryStatuses[enquiry.status] ?? 'Status unavailable'

            return (
              <Card className="customer-enquiry-card" key={enquiry.id}>
                <div className="customer-enquiry-card__content">
                  <div className="customer-enquiry-card__header">
                    <span className={`customer-enquiry-status customer-enquiry-status--${enquiry.status}`}>
                      {statusName}
                    </span>
                    <time dateTime={enquiry.created_at}>{formatDate(enquiry.created_at)}</time>
                  </div>
                  <h2>{enquiry.service || 'Website enquiry'}</h2>
                  <p className="customer-enquiry-card__summary">
                    {enquiry.message}
                  </p>
                  <dl className="customer-enquiry-card__details">
                    {enquiry.business_name && (
                      <div><dt>Business</dt><dd>{enquiry.business_name}</dd></div>
                    )}
                    {enquiry.website_type && (
                      <div><dt>Website type</dt><dd>{enquiry.website_type}</dd></div>
                    )}
                  </dl>
                </div>
                {theme ? (
                  <aside className="customer-enquiry-card__theme" aria-label="Selected website theme">
                    <div className="customer-enquiry-card__theme-title">
                      <Sparkles size={15} aria-hidden="true" />
                      <span>Selected direction</span>
                    </div>
                    <WebsiteThemePreview theme={theme} />
                    <strong>{theme.name}</strong>
                    {theme.category && <span>{theme.category}</span>}
                  </aside>
                ) : (
                  <div className="customer-enquiry-card__theme customer-enquiry-card__theme--empty">
                    <span>No website theme was selected for this enquiry.</span>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CustomerEnquiriesPage

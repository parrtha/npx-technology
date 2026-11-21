import {
  Bell,
  CreditCard,
  FolderKanban,
  Inbox,
  MessageSquareText,
  Search,
  Users,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Card from '../components/Card.jsx'

const sections = {
  enquiries: {
    title: 'Enquiries',
    eyebrow: 'Customer pipeline',
    description: 'Review incoming requests and follow up on prospective work.',
    listTitle: 'All enquiries',
    emptyTitle: 'No enquiry records are connected',
    emptyDescription: 'Enquiry details and status will appear here when business data is integrated.',
    icon: Inbox,
    columns: ['Customer name', 'Email', 'Service', 'Date', 'Status'],
    searchable: true,
  },
  customers: {
    title: 'Customers',
    eyebrow: 'Customer directory',
    description: 'View customer contact details and account information.',
    listTitle: 'Customer directory',
    emptyTitle: 'No customer records are connected',
    emptyDescription: 'Customer names and contact information will appear here when available.',
    icon: Users,
    columns: ['Customer', 'Email', 'Phone', 'Joined'],
  },
  projects: {
    title: 'Projects',
    eyebrow: 'Delivery',
    description: 'Track project ownership, delivery status, progress, and deadlines.',
    listTitle: 'All projects',
    emptyTitle: 'No project records are connected',
    emptyDescription: 'Project names, customer assignments, status, progress, and deadlines will appear here.',
    icon: FolderKanban,
    columns: ['Project', 'Customer', 'Status', 'Progress', 'Deadline'],
  },
  messages: {
    title: 'Messages',
    eyebrow: 'Conversations',
    description: 'Review customer conversations and message status.',
    listTitle: 'All messages',
    emptyTitle: 'No message records are connected',
    emptyDescription: 'Conversation details and sender information will appear here when messaging is integrated.',
    icon: MessageSquareText,
    columns: ['Conversation', 'Sender', 'Date', 'Status'],
  },
  payments: {
    title: 'Payments',
    eyebrow: 'Finance',
    description: 'Review payment records, amounts, and payment status.',
    listTitle: 'All payments',
    emptyTitle: 'No payment records are connected',
    emptyDescription: 'Payment amounts, customer details, dates, and statuses are not available in this preview.',
    icon: CreditCard,
    columns: ['Amount', 'Customer', 'Date', 'Payment status'],
  },
  notifications: {
    title: 'Notifications',
    eyebrow: 'Updates',
    description: 'Review account and workspace notifications.',
    listTitle: 'All notifications',
    emptyTitle: 'No notification records are connected',
    emptyDescription: 'Notification details and read status will appear here when data is integrated.',
    icon: Bell,
    columns: ['Notification', 'Recipient', 'Date', 'Read status'],
  },
}

function AdminSectionPage({ section }) {
  const details = sections[section]
  const Icon = details.icon
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="admin-section-page"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: 'easeOut' }}
    >
      <header className="admin-page-heading">
        <p className="eyebrow"><span className="eyebrow__dot" /> {details.eyebrow}</p>
        <h1>{details.title}</h1>
        <p>{details.description}</p>
      </header>

      <Card className="admin-records-card">
        <div className="admin-records-card__header">
          <div>
            <h2>{details.listTitle}</h2>
            <p>Business data integration pending</p>
          </div>
          {details.searchable && (
            <label className="admin-search">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search enquiries</span>
              <input
                type="search"
                placeholder="Search will be available after integration"
                disabled
                aria-describedby="admin-search-note"
              />
            </label>
          )}
        </div>

        {details.searchable && (
          <p className="admin-search-note" id="admin-search-note">
            Enquiry search becomes available after business data is connected.
          </p>
        )}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {details.columns.map((column) => <th key={column} scope="col">{column}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={details.columns.length}>
                  <div className="admin-empty admin-empty--table" role="status">
                    <span className="admin-empty__icon"><Icon size={20} aria-hidden="true" /></span>
                    <h3>{details.emptyTitle}</h3>
                    <p>{details.emptyDescription}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  )
}

export default AdminSectionPage

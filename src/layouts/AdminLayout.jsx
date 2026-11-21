import {
  Bell,
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Users,
} from 'lucide-react'
import { Outlet } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell.jsx'
import '../styles/admin-dashboard.css'

const navigation = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard },
  { label: 'Enquiries', to: '/admin/enquiries', icon: FileText },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Projects', to: '/admin/projects', icon: FolderKanban },
  { label: 'Messages', to: '/admin/messages', icon: MessageSquareText },
  { label: 'Payments', to: '/admin/payments', icon: CreditCard },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

function AdminLayout() {
  return (
    <DashboardShell
      title="Admin workspace"
      subtitle="Operations"
      basePath="/admin"
      navigation={navigation}
      adminAccount
      workspaceNote="Business data"
      workspaceStatus="Integration pending"
    >
      <Outlet />
    </DashboardShell>
  )
}

export default AdminLayout

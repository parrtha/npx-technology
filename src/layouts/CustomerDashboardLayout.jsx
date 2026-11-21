import {
  Bell,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  MessageSquareText,
  UserRound,
} from 'lucide-react'
import { Outlet } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell.jsx'
import '../styles/customer-dashboard.css'

const navigation = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Projects', to: '/dashboard/projects', icon: FolderKanban },
  { label: 'Messages', to: '/dashboard/messages', icon: MessageSquareText },
  { label: 'Payments', to: '/dashboard/payments', icon: CreditCard },
  { label: 'Notifications', to: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', to: '/dashboard/profile', icon: UserRound },
]

function CustomerDashboardLayout() {
  return (
    <DashboardShell
      title="Client workspace"
      subtitle="Your account"
      basePath="/dashboard"
      navigation={navigation}
      showSidebarSignOut
    >
      <Outlet />
    </DashboardShell>
  )
}

export default CustomerDashboardLayout

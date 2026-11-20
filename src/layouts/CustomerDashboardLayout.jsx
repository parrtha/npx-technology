import { CreditCard, FolderKanban, LayoutDashboard, Settings } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell.jsx'

const navigation = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My projects', to: '/dashboard/projects', icon: FolderKanban },
  { label: 'Billing', to: '/dashboard/billing', icon: CreditCard },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
]

function CustomerDashboardLayout() {
  return (
    <DashboardShell
      title="Client workspace"
      subtitle="Your account"
      basePath="/dashboard"
      navigation={navigation}
    >
      <Outlet />
    </DashboardShell>
  )
}

export default CustomerDashboardLayout

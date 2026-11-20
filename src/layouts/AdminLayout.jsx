import { LayoutDashboard, Settings, Users, Workflow } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell.jsx'

const navigation = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard },
  { label: 'Projects', to: '/admin/projects', icon: Workflow },
  { label: 'Clients', to: '/admin/clients', icon: Users },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

function AdminLayout() {
  return (
    <DashboardShell
      title="Admin workspace"
      subtitle="Administration"
      basePath="/admin"
      navigation={navigation}
    >
      <Outlet />
    </DashboardShell>
  )
}

export default AdminLayout

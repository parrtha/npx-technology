import { Route, Routes } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout.jsx'
import CustomerDashboardLayout from '../layouts/CustomerDashboardLayout.jsx'
import PublicLayout from '../layouts/PublicLayout.jsx'
import AboutPage from '../pages/AboutPage.jsx'
import ContactPage from '../pages/ContactPage.jsx'
import HomePage from '../pages/HomePage.jsx'
import PortfolioPage from '../pages/PortfolioPage.jsx'
import PlaceholderPage from '../pages/PlaceholderPage.jsx'
import ServicesPage from '../pages/ServicesPage.jsx'
import WorkspacePage from '../pages/WorkspacePage.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="work" element={<PortfolioPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route
          path="*"
          element={(
            <PlaceholderPage
              eyebrow="404 — Not found"
              title="This page is off the map."
              description="The link may have changed, or the page may not exist yet."
              actionTo="/"
              actionLabel="Back to home"
            />
          )}
        />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route
          index
          element={(
            <WorkspacePage
              eyebrow="Administration"
              title="Admin overview"
              description="A central place for the NPX team to manage the workspace."
              actionTo="/admin/projects"
              actionLabel="View projects"
              note="Admin tools will be available here once workspace features are configured."
            />
          )}
        />
        <Route
          path="projects"
          element={(
            <WorkspacePage
              eyebrow="Administration"
              title="Projects"
              description="Review and organize work across the NPX workspace."
              actionTo="/admin"
              actionLabel="Back to overview"
              note="Project management is not connected yet. No project records are being shown or simulated."
            />
          )}
        />
        <Route
          path="clients"
          element={(
            <WorkspacePage
              eyebrow="Administration"
              title="Clients"
              description="Client records and workspace access will be managed here."
              actionTo="/admin"
              actionLabel="Back to overview"
              note="Client management is not connected yet. No account data is being shown or simulated."
            />
          )}
        />
        <Route
          path="settings"
          element={(
            <WorkspacePage
              eyebrow="Administration"
              title="Settings"
              description="Workspace preferences and administration settings."
              actionTo="/admin"
              actionLabel="Back to overview"
              note="Settings will become available when the admin workspace is configured."
            />
          )}
        />
      </Route>

      <Route path="dashboard" element={<CustomerDashboardLayout />}>
        <Route
          index
          element={(
            <WorkspacePage
              eyebrow="Client workspace"
              title="Welcome to your workspace"
              description="A clear view of your projects and updates, all in one place."
              actionTo="/dashboard/projects"
              actionLabel="View my projects"
              note="Your workspace is not connected yet. Project updates and account data will appear here when available."
            />
          )}
        />
        <Route
          path="projects"
          element={(
            <WorkspacePage
              eyebrow="Client workspace"
              title="My projects"
              description="Follow progress and find the latest project information."
              actionTo="/dashboard"
              actionLabel="Back to overview"
              note="Project information is not connected yet. No project activity is being simulated."
            />
          )}
        />
        <Route
          path="billing"
          element={(
            <WorkspacePage
              eyebrow="Client workspace"
              title="Billing"
              description="Invoices and billing details will be available in this section."
              actionTo="/dashboard"
              actionLabel="Back to overview"
              note="Billing data is not connected. No payment methods or invoice records are stored in this preview."
            />
          )}
        />
        <Route
          path="settings"
          element={(
            <WorkspacePage
              eyebrow="Client workspace"
              title="Account settings"
              description="Manage your account preferences and workspace details."
              actionTo="/dashboard"
              actionLabel="Back to overview"
              note="Account settings are not connected in this preview."
            />
          )}
        />
      </Route>
    </Routes>
  )
}

export default AppRoutes

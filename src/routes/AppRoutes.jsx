import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Loading from '../components/Loading.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'
import CustomerDashboardLayout from '../layouts/CustomerDashboardLayout.jsx'
import PublicLayout from '../layouts/PublicLayout.jsx'
import AboutPage from '../pages/AboutPage.jsx'
import ContactPage from '../pages/ContactPage.jsx'
import CustomerDashboardPage from '../pages/CustomerDashboardPage.jsx'
import CustomerProfilePage from '../pages/CustomerProfilePage.jsx'
import HomePage from '../pages/HomePage.jsx'
import AuthPage from '../pages/AuthPage.jsx'
import PortfolioPage from '../pages/PortfolioPage.jsx'
import PlaceholderPage from '../pages/PlaceholderPage.jsx'
import ServicesPage from '../pages/ServicesPage.jsx'
import WorkspacePage from '../pages/WorkspacePage.jsx'
import RequireAuth from './RequireAuth.jsx'

const AdminOverviewPage = lazy(() => import('../pages/AdminOverviewPage.jsx'))
const AdminSectionPage = lazy(() => import('../pages/AdminSectionPage.jsx'))
const AdminSettingsPage = lazy(() => import('../pages/AdminSettingsPage.jsx'))

function AdminPage({ children }) {
  return (
    <Suspense fallback={<Loading label="Loading admin workspace" />}>
      {children}
    </Suspense>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="work" element={<PortfolioPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route path="admin/login" element={<AuthPage mode="admin" />} />
        <Route path="forgot-password" element={<AuthPage mode="forgot" />} />
        <Route path="reset-password" element={<AuthPage mode="reset" />} />
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

      <Route
        path="admin"
        element={(
          <RequireAuth role="admin">
            <AdminLayout />
          </RequireAuth>
        )}
      >
        <Route
          index
          element={(
            <AdminPage>
              <AdminOverviewPage />
            </AdminPage>
          )}
        />
        <Route
          path="enquiries"
          element={(
            <AdminPage>
              <AdminSectionPage section="enquiries" />
            </AdminPage>
          )}
        />
        <Route
          path="customers"
          element={(
            <AdminPage>
              <AdminSectionPage section="customers" />
            </AdminPage>
          )}
        />
        <Route
          path="projects"
          element={(
            <AdminPage>
              <AdminSectionPage section="projects" />
            </AdminPage>
          )}
        />
        <Route
          path="messages"
          element={(
            <AdminPage>
              <AdminSectionPage section="messages" />
            </AdminPage>
          )}
        />
        <Route
          path="payments"
          element={(
            <AdminPage>
              <AdminSectionPage section="payments" />
            </AdminPage>
          )}
        />
        <Route
          path="notifications"
          element={(
            <AdminPage>
              <AdminSectionPage section="notifications" />
            </AdminPage>
          )}
        />
        <Route
          path="settings"
          element={(
            <AdminPage>
              <AdminSettingsPage />
            </AdminPage>
          )}
        />
      </Route>

      <Route
        path="dashboard"
        element={(
          <RequireAuth role="customer">
            <CustomerDashboardLayout />
          </RequireAuth>
        )}
      >
        <Route
          index
          element={<CustomerDashboardPage />}
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
              note="Project data integration is pending. No project records are displayed or simulated."
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
          path="messages"
          element={(
            <WorkspacePage
              eyebrow="Client workspace"
              title="Messages"
              description="Project conversations will be available here when messaging is connected."
              actionTo="/dashboard"
              actionLabel="Back to overview"
              note="Message data integration is pending. No conversations are displayed or simulated."
            />
          )}
        />
        <Route
          path="payments"
          element={(
            <WorkspacePage
              eyebrow="Client workspace"
              title="Payments"
              description="Payment and invoice details will appear here when billing is connected."
              actionTo="/dashboard"
              actionLabel="Back to overview"
              note="Payment data integration is pending. No transactions or amounts are displayed or simulated."
            />
          )}
        />
        <Route
          path="notifications"
          element={(
            <WorkspacePage
              eyebrow="Client workspace"
              title="Notifications"
              description="Important project and account updates will be collected here."
              actionTo="/dashboard"
              actionLabel="Back to overview"
              note="Notification data integration is pending. No notifications are displayed or simulated."
            />
          )}
        />
        <Route path="profile" element={<CustomerProfilePage />} />
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

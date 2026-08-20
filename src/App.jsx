import { Routes, Route } from 'react-router-dom'
import { RequireAuth } from '@/auth/RequireAuth'
import { RequireControlPanelAccess } from '@/auth/RequireControlPanelAccess'

import LoginPage from '@/auth/LoginPage'
import LandingPage from '@/marketing/LandingPage'

import DashboardPage from '@/dashboard/DashboardPage'
import ChatPage from '@/chat/ChatPage'
import CustomersPage from '@/people/CustomersPage'
import ConversationsPage from '@/chat/ConversationsPage'
import OrdersPage from '@/orders/OrdersPage'
import ProductsPage from '@/products/ProductsPage'
import InventoryPage from '@/inventory/InventoryPage'
import PaymentsPage from '@/payments/PaymentsPage'
import PeoplePage from '@/people/PeoplePage'
import AssetsPage from '@/workflows/AssetsPage'
import OperationsPage from '@/workflows/WorkflowsPage'
import DocumentsPage from '@/documents/DocumentsPage'
import JobsPage from '@/workflows/JobsPage'
import MilestonesPage from '@/workflows/MilestonesPage'
import SettingsPage from '@/org-settings/SettingsPage'
import ReportsPage from '@/reports/ReportsPage'
import ControlPanelPage from '@/control-panel/ControlPanelPage'

import StorefrontPage from '@/sales-portal/StorefrontPage'
import ProductDetailPage from '@/sales-portal/ProductDetailPage'
import CartPage from '@/sales-portal/CartPage'
import StorefrontChatPage from '@/sales-portal/StorefrontChatPage'

import AppLayout from '@/util/layouts/AppLayout'
import PortalLayout from '@/util/layouts/PortalLayout'
import NotFoundPage from '@/util/components/NotFoundPage'

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<LandingPage />} />

      {/* Public sales portal, scoped by org slug */}
      <Route element={<PortalLayout />}>
        <Route path="/:orgSlug" element={<StorefrontPage />} />
        <Route path="/:orgSlug/products/:id" element={<ProductDetailPage />} />
        <Route path="/:orgSlug/cart" element={<CartPage />} />
        <Route path="/:orgSlug/chat" element={<StorefrontChatPage />} />
      </Route>

      {/* Protected app */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/app/chat" element={<ChatPage />} />
        <Route path="/app/customers" element={<CustomersPage />} />
        <Route path="/app/conversations" element={<ConversationsPage />} />
        <Route path="/app/orders" element={<OrdersPage />} />
        <Route path="/app/products" element={<ProductsPage />} />
        <Route path="/app/inventory" element={<InventoryPage />} />
        <Route path="/app/payments" element={<PaymentsPage />} />
        <Route path="/app/people" element={<PeoplePage />} />
        <Route path="/app/assets" element={<AssetsPage />} />
        <Route path="/app/operations" element={<OperationsPage />} />
        <Route path="/app/jobs" element={<JobsPage />} />
        <Route path="/app/milestones" element={<MilestonesPage />} />
        <Route path="/app/documents" element={<DocumentsPage />} />
        <Route path="/app/settings" element={<SettingsPage />} />
        <Route path="/app/reports" element={<ReportsPage />} />
        <Route
          path="/app/control-panel"
          element={
            <RequireControlPanelAccess>
              <ControlPanelPage />
            </RequireControlPanelAccess>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App

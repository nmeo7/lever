import { Routes, Route } from 'react-router-dom'
import { RequireAuth } from '@/auth/RequireAuth'
import { RequireGuest } from '@/auth/RequireGuest'
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
import ResourcesPage from '@/resources/ResourcesPage'
import OperationsPage from '@/workflows/WorkflowsPage'
import KnowledgePage from '@/knowledge/KnowledgePage'
import JobsPage from '@/workflows/JobsPage'
import PlansPage from '@/plans/PlansPage'
import SettingsPage from '@/org-settings/SettingsPage'
import ReportsPage from '@/reports/ReportsPage'
import ControlPanelPage from '@/control-panel/ControlPanelPage'
import SuppliersPage from '@/suppliers/SuppliersPage'
import CategoriesPage from '@/categories/CategoriesPage'
import TaxonomyPage from '@/taxonomy/TaxonomyPage'
import LocationsPage from '@/locations/LocationsPage'
import RecurringTransactionsPage from '@/recurring-transactions/RecurringTransactionsPage'

import FrontdeskPage from '@/sales-portal/FrontdeskPage'
import ProductDetailPage from '@/sales-portal/ProductDetailPage'
import CartPage from '@/sales-portal/CartPage'
import FrontdeskChatPage from '@/sales-portal/FrontdeskChatPage'

import AppLayout from '@/util/layouts/AppLayout'
import PortalLayout from '@/util/layouts/PortalLayout'
import NotFoundPage from '@/util/components/NotFoundPage'

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />
      <Route path="/" element={<LandingPage />} />

      {/* Public sales portal, scoped by org slug */}
      <Route element={<PortalLayout />}>
        <Route path="/:orgSlug" element={<FrontdeskPage />} />
        <Route path="/:orgSlug/products/:id" element={<ProductDetailPage />} />
        <Route path="/:orgSlug/cart" element={<CartPage />} />
        <Route path="/:orgSlug/chat" element={<FrontdeskChatPage />} />
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
        <Route path="/app/resources" element={<ResourcesPage />} />
        <Route path="/app/operations" element={<OperationsPage />} />
        <Route path="/app/jobs" element={<JobsPage />} />
        <Route path="/app/plans" element={<PlansPage />} />
        <Route path="/app/knowledge" element={<KnowledgePage />} />
        <Route path="/app/settings" element={<SettingsPage />} />
        <Route path="/app/reports" element={<ReportsPage />} />
        <Route path="/app/suppliers" element={<SuppliersPage />} />
        <Route path="/app/categories" element={<CategoriesPage />} />
        <Route path="/app/taxonomy" element={<TaxonomyPage />} />
        <Route path="/app/locations" element={<LocationsPage />} />
        <Route path="/app/recurring-transactions" element={<RecurringTransactionsPage />} />
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

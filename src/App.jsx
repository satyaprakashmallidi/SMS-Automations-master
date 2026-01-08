import './styles/App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SidebarProvider } from './context/SidebarContext.jsx'
import { ToastProvider } from './context/ToastProvider.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import ScrollToTop from './components/ui/ScrollToTop.jsx'
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx'
import { PublicRoute } from './components/auth/PublicRoute.jsx'

// Pages
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import DashboardLayout from './components/layout/DashboardLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CustomersPage from './pages/CustomersPage.jsx'
import InboxPage from './pages/InboxPage.jsx'
import CampaignsPage from './pages/CampaignsPage.jsx'
import TagsPage from './pages/TagsPage.jsx'
import TemplatesPage from './pages/TemplatesPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

// Settings Tabs
import AccountTab from './components/settings/AccountTab.jsx'
import CompanyTab from './components/settings/CompanyTab.jsx'
import SMSSettingsTab from './components/settings/SMSSettingsTab.jsx'
import BillingTab from './components/settings/BillingTab.jsx'
import ToastContainer from './components/ui/ToastContainer.jsx'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SidebarProvider>
          <ToastContainer />
          <ScrollToTop />
          <Routes>
            {/* Public Routes - Accessible without authentication */}
            <Route path="/landing" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes - Require authentication */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="inbox" element={<InboxPage />} />
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="tags" element={<TagsPage />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="settings" element={<SettingsPage />}>
                <Route index element={<Navigate to="account" />} />
                <Route path="account" element={<AccountTab />} />
                <Route path="company" element={<CompanyTab />} />
                <Route path="sms-settings" element={<SMSSettingsTab />} />
                <Route path="billing" element={<BillingTab />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App

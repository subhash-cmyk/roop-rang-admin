import type { ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminLayout from './layouts/AdminLayout'
import HeroBannerPage from './pages/HeroBannerPage'

import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import OfferPage from './pages/OfferPage'
import InquiryPage from './pages/InquiryPage'
import UserPage from './pages/UserPage'
import SettingsPage from './pages/SettingsPage'
//import SupportPage from './pages/SupportPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'

function Protected({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('admin_token')
  return token ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <Protected>
            <AdminLayout />
          </Protected>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/offers" element={<OfferPage />} />
        <Route path="/inquiries" element={<InquiryPage />} />
        <Route path="/users" element={<UserPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/hero-banner" element={<HeroBannerPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import DashboardLayout from './components/DashboardLayout';
import PublicLayout from './components/PublicLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Public / Buyer Pages
import Browse from './pages/public/Browse';
import PartDetails from './pages/public/PartDetails';
import OrderConfirmation from './pages/public/OrderConfirmation';
import AccessDenied from './pages/public/AccessDenied';
import NotFound from './pages/public/NotFound';

// User / Seller Account Pages
import AccountOverview from './pages/account/AccountOverview';
import MyListings from './pages/account/MyListings';
import Inventory from './pages/account/Inventory';
import SoldItems from './pages/account/SoldItems';
import OrderHistory from './pages/account/OrderHistory';
import PersonalDetails from './pages/account/PersonalDetails';
import Security from './pages/account/Security';
import ListingForm from './pages/account/ListingForm';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import ListingModeration from './pages/admin/ListingModeration';
import AuditLogs from './pages/admin/AuditLogs';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public / Buyer Routes */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route element={<PublicLayout />}>
          <Route path="/browse" element={<Browse />} />
          <Route path="/parts/:id" element={<PartDetails />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route element={<PublicLayout requireAuth />}>
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* User / Seller Portal */}
        <Route path="/account" element={<DashboardLayout isAdmin={false} />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AccountOverview />} />
          <Route path="listings" element={<MyListings />} />
          <Route path="listings/new" element={<ListingForm mode="create" />} />
          <Route path="listings/:id/edit" element={<ListingForm mode="edit" />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="sold-items" element={<SoldItems />} />
          <Route path="order-history" element={<OrderHistory />} />
          <Route path="personal-details" element={<PersonalDetails />} />
          <Route path="security" element={<Security />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Route>

        {/* Admin Portal */}
        <Route path="/admin" element={<DashboardLayout isAdmin={true} />}>
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="moderation" element={<ListingModeration />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="security" element={<Security />} />
          <Route path="*" element={<Navigate to="users" replace />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
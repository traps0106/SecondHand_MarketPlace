import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import DashboardLayout from './components/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// User / Seller Account Pages
import AccountOverview from './pages/account/AccountOverview';
import MyListings from './pages/account/MyListings';
import Inventory from './pages/account/Inventory';
import SoldItems from './pages/account/SoldItems';
import OrderHistory from './pages/account/OrderHistory';
import PersonalDetails from './pages/account/PersonalDetails';
import Security from './pages/account/Security';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import ListingModeration from './pages/admin/ListingModeration';
import AuditLogs from './pages/admin/AuditLogs';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* User / Seller Portal */}
        <Route path="/account" element={<DashboardLayout isAdmin={false} />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AccountOverview />} />
          <Route path="listings" element={<MyListings />} />
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
          <Route path="*" element={<Navigate to="users" replace />} />
        </Route>

        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
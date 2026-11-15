import React from 'react';
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { isAdmin as hasAdminRole, isSignedIn, signOut } from '../auth';

export default function DashboardLayout({ isAdmin = false }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        signOut();
        navigate('/login');
    };

    // Role check: signed-out users go to login, non-admins see Access denied on admin pages.
    if (!isSignedIn()) return <Navigate to="/login" replace />;
    if (isAdmin && !hasAdminRole()) return <Navigate to="/access-denied" replace />;

    return (
        <div>
            {/* App Header */}
            <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Parts Market</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/browse" className="public-nav-link">Browse parts</Link>
                    <span className="portal-label">
                        {isAdmin ? 'Admin Portal' : 'User Portal'}
                    </span>
                </div>
            </header>

            {/* Main Layout Container */}
            <div className="layout-container">
                {/* Sidebar Navigation */}
                <aside className="sidebar">
                    <div>
                        <div className="sidebar-title">
                            {isAdmin ? 'Administration' : 'MY ACCOUNT'}
                        </div>
                        <nav className="nav-list">
                            {!isAdmin ? (
                                <>
                                    <NavLink to="/account/overview" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        Overview
                                    </NavLink>
                                    <NavLink to="/account/listings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        My listings
                                    </NavLink>
                                    <NavLink to="/account/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        Inventory
                                    </NavLink>
                                    <NavLink to="/account/sold-items" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        Sold items
                                    </NavLink>
                                    <NavLink to="/account/order-history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        Order history
                                    </NavLink>
                                    <NavLink to="/account/personal-details" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        Personal details
                                    </NavLink>
                                    <NavLink to="/account/security" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        Security
                                    </NavLink>

                                    {/* Sidebar Separator Line & Log Out Button */}
                                    <div className="nav-separator" />
                                    <button
                                        onClick={handleLogout}
                                        className="nav-item"
                                    >
                                        Log out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        Overview
                                    </NavLink>
                                    <NavLink to="/admin/moderation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        Listing moderation
                                    </NavLink>
                                    <NavLink to="/admin/audit-logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        Audit logs
                                    </NavLink>
                                    <NavLink to="/admin/security" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        Security
                                    </NavLink>

                                    {/* Sidebar Separator Line & Log Out Button */}
                                    <div className="nav-separator" />
                                    <button
                                        onClick={handleLogout}
                                        className="nav-item"
                                    >
                                        Log out
                                    </button>
                                </>
                            )}
                        </nav>
                    </div>
                </aside>

                {/* Page Main Content */}
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
import React from 'react';
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { isSignedIn, signOut } from '../auth';

// Header + main landmark for public / buyer-facing pages (browse, details, errors).
export default function PublicLayout({ requireAuth = false }) {
    const navigate = useNavigate();
    const signedIn = isSignedIn();

    if (requireAuth && !signedIn) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        signOut();
        navigate('/login');
    };

    return (
        <div>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <header className="app-header public-header">
                <h1>
                    <Link to="/browse" className="brand-link">Parts Market</Link>
                </h1>
                <nav aria-label="Main" className="public-nav">
                    {signedIn && <span className="public-nav-user">Signed in</span>}
                    <Link to="/browse" className="public-nav-link">Browse parts</Link>
                    {signedIn ? (
                        <>
                            <Link to="/account/overview" className="public-nav-link">My account</Link>
                            <button type="button" className="btn-secondary" onClick={handleLogout}>Log out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="public-nav-link">Log in</Link>
                            <Link to="/register" className="btn-primary btn-link">Create account</Link>
                        </>
                    )}
                </nav>
            </header>
            <main id="main-content" tabIndex={-1} className="public-main">
                <Outlet />
            </main>
        </div>
    );
}

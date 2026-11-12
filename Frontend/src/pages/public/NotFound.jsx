import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="message-page">
            <h2>Page not found</h2>
            <p>
                The page you are looking for does not exist, or your session has expired. Return to
                browse or log in again.
            </p>
            <div className="delete-actions">
                <Link to="/browse" className="btn-primary btn-link">Back to browse</Link>
                <Link to="/login" className="btn-secondary btn-link">Log in</Link>
            </div>
        </div>
    );
}

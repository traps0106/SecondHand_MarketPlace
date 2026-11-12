import React from 'react';
import { Link } from 'react-router-dom';

export default function AccessDenied() {
    return (
        <div className="message-page">
            <h2>Access denied</h2>
            <p>
                Your account role does not have permission to open this page. If you think this is a
                mistake, contact an administrator.
            </p>
            <div className="delete-actions">
                <Link to="/browse" className="btn-primary btn-link">Back to browse</Link>
                <Link to="/login" className="btn-secondary btn-link">Log in as a different user</Link>
            </div>
        </div>
    );
}

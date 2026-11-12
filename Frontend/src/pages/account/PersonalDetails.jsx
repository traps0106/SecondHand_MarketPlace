import React, { useState } from 'react';

export default function PersonalDetails() {
    const [fullName, setFullName] = useState('ActualName');
    const [displayName, setDisplayName] = useState('UserName');
    const [linkedEmail, setLinkedEmail] = useState('user@example.com');

    const handleSave = (e) => {
        e.preventDefault();
        alert('Saved!');
    };

    const handleCancel = () => {
        setFullName('ActualName');
        setDisplayName('UserName');
        setLinkedEmail('user@example.com');
    };

    return (
        <div className="card" style={{ maxWidth: '500px' }}>
            <h2 className="card-title">Personal details</h2>
            <p className="card-subtitle">
                Keep your name, display name, and sign-in email up to date.
            </p>

            <form onSubmit={handleSave}>
                <div className="form-group">
                    <label htmlFor="FullName">Full name</label>
                    <input
                        id="FullName"
                        type="text"
                        className="form-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="DisplayName">Display Name</label>
                    <input
                        id="DisplayName"
                        type="text"
                        className="form-input"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="LinkMail">Linked email</label>
                    <input
                        id="LinkMail"
                        type="email"
                        className="form-input"
                        value={linkedEmail}
                        onChange={(e) => setLinkedEmail(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn-primary">
                        Save changes
                    </button>
                    <button type="button" onClick={handleCancel} className="btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
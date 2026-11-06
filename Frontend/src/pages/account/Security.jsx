import React, { useState } from 'react';

export default function Security() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [deleteCurrentPassword, setDeleteCurrentPassword] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handlePasswordUpdate = (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match.');
            return;
        }

        alert('Password updated successfully!');
    };

    const handlePasswordCancel = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleDeleteAccount = (e) => {
        e.preventDefault();
        alert('Account deletion request submitted.');
    };

    return (
        <div>
            {/* Change Password Card */}
            <div className="card" style={{ maxWidth: '500px' }}>
                <h2 className="card-title">Change password</h2>

                <form onSubmit={handlePasswordUpdate}>
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Current password</label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ background: 'none', border: 'none', color: '#4b5563', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem' }}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-input"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>New password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter a new password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm new password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat new password"
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn-primary">
                            Update password
                        </button>
                        <button type="button" onClick={handlePasswordCancel} className="btn-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* Delete Account Card */}
            <div className="card" style={{ maxWidth: '500px' }}>
                <h2 className="card-title" >
                    Delete account
                </h2>

                <form onSubmit={handleDeleteAccount}>
                    <div className="form-group">
                        <label>Current password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={deleteCurrentPassword}
                            onChange={(e) => setDeleteCurrentPassword(e.target.value)}
                            required
                        />
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            Your password is required to close this account.
                        </p>
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            id="delCheck"
                            checked={confirmDelete}
                            onChange={(e) => setConfirmDelete(e.target.checked)}
                        />
                        <label htmlFor="delCheck" style={{ fontSize: '0.75rem', fontWeight: 400, margin: 0 }}>
                            Account deletion confirmation
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={!confirmDelete || !deleteCurrentPassword}
                        className="btn-primary"
                        style={{
                            opacity: (!confirmDelete || !deleteCurrentPassword) ? 0.5 : 1,
                            cursor: (!confirmDelete || !deleteCurrentPassword) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Delete
                    </button>
                </form>
            </div>
        </div>
    );
}
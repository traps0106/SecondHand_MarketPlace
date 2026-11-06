import React from 'react';

export default function UserManagement() {
    const users = [
        { name: 'UserName', detail: 'ActualName | email', role: 'User', status: 'Active' },
        { name: 'UserName', detail: 'ActualName | email', role: 'User', status: 'Active', selected: true },
        { name: 'UserName', detail: 'ActualName | email', role: 'Admin', status: 'Active' },
        { name: 'UserName', detail: 'ActualName | email', role: 'User', status: 'Suspended' },
    ];

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>User management</h2>

            <div className="filter-toolbar">
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Search users</label>
                    <input type="text" placeholder="Name or email" className="form-input" />
                </div>
                <div style={{ width: '140px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Role</label>
                    <select className="form-input"><option>All roles</option></select>
                </div>
                <div style={{ width: '140px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Status</label>
                    <select className="form-input"><option>All statuses</option></select>
                </div>
                <button className="btn-secondary">Search</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => (
                                <tr key={i} style={{ backgroundColor: u.selected ? '#e5e7eb' : 'transparent' }}>
                                    <td>
                                        <strong>{u.name}</strong>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{u.detail}</div>
                                    </td>
                                    <td>{u.role}</td>
                                    <td>{u.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <h3 className="card-title">Suspend User account</h3>
                    <p className="card-subtitle">Login will be blocked and active sessions ended. His listings will be hidden while suspended.</p>
                    <div className="form-group">
                        <label>Reason *</label>
                        <input type="text" className="form-input" defaultValue="Listings under policy review" />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button className="btn-primary">Confirm suspension</button>
                        <button className="btn-secondary">Cancel</button>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Audit record created on confirmation. Cancelling leaves the account unchanged.</p>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';

export default function UserManagement() {
    const users = [
        { name: 'UserName', detail: 'ActualName | email', role: 'User', status: 'Active' },
        { name: 'UserName', detail: 'ActualName | email', role: 'User', status: 'Active', selected: true },
        { name: 'UserName', detail: 'ActualName | email', role: 'Admin', status: 'Active' },
        { name: 'UserName', detail: 'ActualName | email', role: 'User', status: 'Suspended' },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All roles');
    const [statusFilter, setStatusFilter] = useState('All statuses');

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.detail.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole =
            roleFilter === 'All roles' || user.role === roleFilter;

        const matchesStatus =
            statusFilter === 'All statuses' || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <div>
            <div className="page-heading">
                <h2>User management</h2>
            </div>

            <div className="filter-toolbar">
                <div className="filter-search">
                    <label htmlFor="user-search">Search users</label>
                    <input
                        id="user-search"
                        name="user-search"
                        type="text"
                        placeholder="Name or email"
                        className="form-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-status">
                    <label htmlFor="user-role">Role</label>
                    <select
                        id="user-role"
                        name="user-role"
                        className="form-input"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="All roles">All roles</option>
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>

                <div className="filter-status">
                    <label htmlFor="user-status">Status</label>
                    <select
                        id="user-status"
                        name="user-status"
                        className="form-input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All statuses">All statuses</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </div>

                <button className="btn-secondary" type="button">
                    Search
                </button>
            </div>

            <div className="user-management-grid">
                <div className="card user-table-card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th scope="col">User</th>
                                <th scope="col">Role</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user, index) => (
                                    <tr
                                        key={index}
                                        className={user.selected ? 'selected-user-row' : ''}
                                    >
                                        <td>
                                            <strong>{user.name}</strong>
                                            <div className="user-detail">
                                                {user.detail}
                                            </div>
                                        </td>
                                        <td>{user.role}</td>
                                        <td>
                                            <span className="status-badge">
                                                {user.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">No matching users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <h3 className="card-title">Suspend User account</h3>

                    <p className="card-subtitle">
                        Login will be blocked and active sessions ended. Their
                        listings will be hidden while suspended.
                    </p>

                    <div className="form-group">
                        <label htmlFor="suspension-reason">Reason *</label>
                        <input
                            id="suspension-reason"
                            name="suspension-reason"
                            type="text"
                            className="form-input"
                            defaultValue="Listings under policy review"
                        />
                    </div>

                    <div className="user-management-actions">
                        <button className="btn-primary" type="button">
                            Confirm suspension
                        </button>

                        <button className="btn-secondary" type="button">
                            Cancel
                        </button>
                    </div>

                    <p className="user-management-note">
                        Audit record created on confirmation. Cancelling leaves
                        the account unchanged.
                    </p>
                </div>
            </div>
        </div>
    );
}

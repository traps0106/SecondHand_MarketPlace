import React from 'react';

export default function ListingModeration() {
    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Listing moderation</h2>

            <div className="filter-toolbar" style={{ maxWidth: '600px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Search listings</label>
                    <input type="text" placeholder="Part, listing ID or seller" className="form-input" />
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
                                <th>Listing / seller</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ backgroundColor: '#e5e7eb' }}>
                                <td>
                                    <strong>BMW E90 side mirror · right</strong>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>2005–2011 · L-203</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Seller: UserName</div>
                                </td>
                                <td>In review</td>
                                <td><button style={{ border: 'none', background: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Review</button></td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Toyota Corolla alternator</strong>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>2014–2018 · L-201</div>
                                </td>
                                <td>Active</td>
                                <td><button style={{ border: 'none', background: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Review</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div>
                    <div className="card">
                        <h3 className="card-title">Listing preview · L-203</h3>
                        <p style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>BMW E90 side mirror · right · 2005–2011</p>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Seller: UserName · ActualName | Phone number | email</p>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0' }}>Used · BHD18.000 · Stock: 1 · In review</p>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>Description: Used right-side mirror; housing intact.</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-primary">Approve listing</button>
                            <button className="btn-secondary">Reject listing</button>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="card-title">Reject listing?</h3>
                        <div className="form-group">
                            <label>Reason *</label>
                            <input type="text" className="form-input" defaultValue="Add clear photos of the mirror and connector" />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>L-203 will not be published. This reason will be shown to UserName.</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-primary">Confirm rejection</button>
                            <button className="btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
import React from 'react';

export default function MyListings() {
    const listings = [
        { id: 'L-201', name: 'Toyota Corolla alternator', year: '2014–2018', price: '35.000', stock: 3, status: 'Active' },
        { id: 'L-202', name: 'Honda Civic headlamp · left', year: '2016–2020', price: '22.000', stock: 2, status: 'Active' },
        { id: 'L-203', name: 'BMW E90 side mirror · right', year: '2005–2011', price: '18.000', stock: 1, status: 'In review' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>My listings</h2>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Create and manage your secondhand car part listings.</p>
                </div>
                <button className="btn-primary">Create listing</button>
            </div>

            <div className="filter-toolbar">
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Search my listings</label>
                    <input type="text" placeholder="Part name or vehicle" className="form-input" />
                </div>
                <div style={{ width: '180px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Moderation status</label>
                    <select className="form-input"><option>All statuses</option></select>
                </div>
                <button className="btn-secondary">Apply filters</button>
            </div>

            <div className="card">
                <h3 className="card-title">My listing list</h3>
                <p className="card-subtitle">3 listings · Only your listings are shown · Prices in BHD</p>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Part / vehicle</th>
                            <th>Price (BHD)</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listings.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <strong>{item.name}</strong>
                                    <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{item.year} · {item.id}</div>
                                </td>
                                <td>{item.price}</td>
                                <td>{item.stock}</td>
                                <td><span className="status-badge">{item.status}</span></td>
                                <td>
                                    <button style={{ border: 'none', background: 'none', textDecoration: 'underline', cursor: 'pointer', marginRight: '0.5rem' }}>Edit</button>
                                    <button style={{ border: 'none', background: 'none', textDecoration: 'underline', color: '#dc2626', cursor: 'pointer' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Delete listing?</h4>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>BMW E90 side mirror · right · 2005–2011 · L-203</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>This removes the listing from your account and the marketplace. This cannot be undone.</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-primary">Confirm delete</button>
                    <button className="btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    );
}
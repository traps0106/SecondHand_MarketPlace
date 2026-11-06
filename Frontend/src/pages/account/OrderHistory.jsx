import React from 'react';

export default function OrderHistory() {
    const orders = [
        { id: 'PM-1042', date: '02 Nov 2026', part: 'Toyota Corolla alternator', qty: 1, status: 'Processing' },
        { id: 'PM-1031', date: '29 Oct 2026', part: 'Honda Civic headlamp · left', qty: 1, status: 'Completed' },
        { id: 'PM-1018', date: '23 Oct 2026', part: 'BMW E90 side mirror · right', qty: 2, status: 'Cancelled' },
    ];

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>My order history</h2>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Review the secondhand car parts you've ordered.</p>
            </div>

            <div className="filter-toolbar">
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Search my orders</label>
                    <input type="text" placeholder="Order number or part name" className="form-input" />
                </div>
                <div style={{ width: '180px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Order status</label>
                    <select className="form-input"><option>All statuses</option></select>
                </div>
                <button className="btn-secondary">Apply filters</button>
            </div>

            <div className="card">
                <h3 className="card-title">Order list</h3>
                <p className="card-subtitle">3 orders · Newest first · Only your records are shown</p>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Date</th>
                            <th>Secondhand car part</th>
                            <th>Qty</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => (
                            <tr key={o.id}>
                                <td><strong>{o.id}</strong></td>
                                <td style={{ color: '#4b5563' }}>{o.date}</td>
                                <td><strong>{o.part}</strong></td>
                                <td>{o.qty}</td>
                                <td><span className="status-badge">{o.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Order PM-1042 · Summary</h4>
                <p style={{ fontSize: '0.75rem', fontWeight: 500 }}>Toyota Corolla alternator · 2014–2018 · Used</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Seller: Auto Spares · Quantity: 1</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Placed 02 Nov 2026 · Processing</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', italic: 'true', marginTop: '0.5rem' }}>
                    This order is simulated. Availability was checked before the order was recorded.
                </p>
            </div>
        </div>
    );
}
import React from 'react';
import { Link } from 'react-router-dom';

export default function AccountOverview() {
    const listings = [
        { id: 'L-201', name: 'Toyota Corolla alternator', year: '2014-2018', price: '35.000', stock: 3, status: 'Active' },
        { id: 'L-202', name: 'Honda Civic headlamp left', year: '2016-2020', price: '22.000', stock: 2, status: 'Active' },
    ];

    const orders = [
        { id: 'PM-1042', date: '02 Nov 2026', part: 'Toyota Corolla alternator', qty: 1, status: 'Processing' },
        { id: 'PM-1031', date: '29 Oct 2026', part: 'Honda Civic headlamp left', qty: 1, status: 'Completed' },
        { id: 'PM-1018', date: '23 Oct 2026', part: 'BMW E90 side mirror right', qty: 2, status: 'Cancelled' },
    ];

    return (
        <div>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="card-title">UserName</h2>
                    <p className="card-subtitle" style={{ margin: 0 }}>ActualName | Phone number | email</p>
                </div>
                <Link to="/account/personal-details" className="btn-secondary" style={{ textDecoration: 'none' }}>
                    Edit personal details
                </Link>
            </div>

            <div className="card">
                <h3 className="card-title">Recent listings</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Part/vehicle</th>
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
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.year} {item.id}</div>
                                </td>
                                <td>{item.price}</td>
                                <td>{item.stock}</td>
                                <td>
                                    <span className="status-badge">{item.status}</span>
                                </td>
                                <td>
                                    <Link to={`/account/listings/${item.id}/edit`} className="text-link" aria-label={`Edit ${item.name}`}>Edit</Link>{' '}
                                    <Link to="/account/listings" className="text-link" aria-label={`Delete ${item.name}`}>Delete</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h3 className="card-title">Recent orders</h3>
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
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td><code>{order.id}</code></td>
                                <td>{order.date}</td>
                                <td>{order.part}</td>
                                <td>{order.qty}</td>
                                <td>
                                    <span className="status-badge">{order.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p style={{ marginTop: '1rem' }}>
                    <Link to="/account/order-history" className="text-link">View full order history →</Link>
                </p>
            </div>
        </div>
    );
}
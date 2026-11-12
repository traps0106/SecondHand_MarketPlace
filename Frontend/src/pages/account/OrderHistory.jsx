
import React from 'react';

export default function OrderHistory() {
    const orders = [
        { id: 'PM-1042', date: '02 Nov 2026', part: 'Toyota Corolla alternator', qty: 1, status: 'Processing' },
        { id: 'PM-1031', date: '29 Oct 2026', part: 'Honda Civic headlamp · left', qty: 1, status: 'Completed' },
        { id: 'PM-1018', date: '23 Oct 2026', part: 'BMW E90 side mirror · right', qty: 2, status: 'Cancelled' },
    ];

    return (
        <div>
            <div className="page-heading">
                <h2>My order history</h2>
                <p>Review the secondhand car parts you've ordered.</p>
            </div>

            <div className="filter-toolbar">
                <div className="filter-search">
                    <label htmlFor="order-search">
                        Search my orders
                    </label>
                    <input
                        id="order-search"
                        type="text"
                        placeholder="Order number or part name"
                        className="form-input"
                    />
                </div>

                <div className="filter-status">
                    <label htmlFor="order-status">
                        Order status
                    </label>
                    <select
                        id="order-status"
                        name="order-status"
                        className="form-input"
                    >
                        <option value="all">All statuses</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                <button className="btn-secondary" type="button">
                    Apply filters
                </button>
            </div>

            <div className="card">
                <h3 className="card-title">Order list</h3>
                <p className="card-subtitle">
                    3 orders · Newest first · Only your records are shown
                </p>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th scope="col">Order</th>
                            <th scope="col">Date</th>
                            <th scope="col">Secondhand car part</th>
                            <th scope="col">Qty</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.map((o) => (
                            <tr key={o.id}>
                                <td><strong>{o.id}</strong></td>
                                <td>{o.date}</td>
                                <td><strong>{o.part}</strong></td>
                                <td>{o.qty}</td>
                                <td>
                                    <span className="status-badge">
                                        {o.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h4 className="order-summary-title">
                    Order PM-1042 · Summary
                </h4>

                <p className="order-summary-part">
                    Toyota Corolla alternator · 2014–2018 · Used
                </p>

                <p className="order-summary-details">
                    Seller: Auto Spares · Quantity: 1
                </p>

                <p className="order-summary-details">
                    Placed 02 Nov 2026 · Processing
                </p>

                <p className="order-summary-note">
                    This order is simulated. Availability was checked before the order was recorded.
                </p>
            </div>
        </div>
    );
}

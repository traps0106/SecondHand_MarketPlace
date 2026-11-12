
import React, { useState } from 'react';

export default function SoldItems() {
    const orders = [
        {
            id: 'PM-1042',
            date: '02 Nov 2026',
            buyer: 'BuyerName',
            part: 'Toyota Corolla alternator',
            vehicle: '2014–2018',
            condition: 'Used',
            qty: 1,
            status: 'Processing',
            seller: 'UserName',
        },
        {
            id: 'PM-1031',
            date: '29 Oct 2026',
            buyer: 'BuyerName',
            part: 'Honda Civic headlamp · left',
            vehicle: '2016–2020',
            condition: 'Used',
            qty: 1,
            status: 'Completed',
            seller: 'UserName',
        },
        {
            id: 'PM-1018',
            date: '23 Oct 2026',
            buyer: 'BuyerName',
            part: 'BMW E90 side mirror · right',
            vehicle: '2005–2011',
            condition: 'Used',
            qty: 2,
            status: 'Cancelled',
            seller: 'UserName',
        },
    ];

    const [selectedOrder, setSelectedOrder] = useState(orders[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All statuses');

    const filteredOrders = orders.filter((order) => {
        const searchMatch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.part.toLowerCase().includes(searchTerm.toLowerCase());

        const statusMatch =
            statusFilter === 'All statuses' || order.status === statusFilter;

        return searchMatch && statusMatch;
    });

    return (
        <div>
            <div className="page-heading">
                <h2>Sold items</h2>
                <p>Review received orders for your secondhand car parts.</p>
            </div>

            <div className="filter-toolbar">
                <div className="filter-search">
                    <label htmlFor="sold-search">Search received orders</label>
                    <input
                        id="sold-search"
                        name="sold-search"
                        type="text"
                        className="form-input"
                        placeholder="Order number, buyer or part name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-status">
                    <label htmlFor="sold-status">Order status</label>
                    <select
                        id="sold-status"
                        name="sold-status"
                        className="form-input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All statuses">All statuses</option>
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
                <h3 className="card-title">Received orders</h3>
                <p className="card-subtitle">
                    {filteredOrders.length} simulated orders · Newest first · Only orders for your parts are shown
                </p>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th scope="col">Order</th>
                            <th scope="col">Date</th>
                            <th scope="col">Buyer</th>
                            <th scope="col">Secondhand car part</th>
                            <th scope="col">Qty</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => {
                                const isSelected = selectedOrder?.id === order.id;

                                return (
                                    <tr
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={isSelected ? 'selected-order-row' : ''}
                                        tabIndex={0}
                                        aria-label={`View order ${order.id}`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setSelectedOrder(order);
                                            }
                                        }}
                                    >
                                        <td>
                                            <strong>{order.id}</strong>
                                        </td>
                                        <td>{order.date}</td>
                                        <td>{order.buyer}</td>
                                        <td>{order.part}</td>
                                        <td>{order.qty}</td>
                                        <td>
                                            <span className="status-badge">
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6">No matching orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="order-table-footer">
                    <span>
                        Showing {filteredOrders.length > 0 ? 1 : 0}–{filteredOrders.length} of {filteredOrders.length}
                    </span>
                    <button className="btn-secondary" type="button" disabled>
                        Page 1
                    </button>
                </div>
            </div>

            {selectedOrder && (
                <div className="card">
                    <h3 className="card-title">
                        Order {selectedOrder.id} · Received order details
                    </h3>

                    <p className="order-summary-part">
                        {selectedOrder.part} · {selectedOrder.vehicle} · {selectedOrder.condition} · Quantity: {selectedOrder.qty}
                    </p>

                    <p className="order-summary-details">
                        Buyer: {selectedOrder.buyer} · Seller: {selectedOrder.seller} · Placed {selectedOrder.date} · {selectedOrder.status}
                    </p>

                    <p className="order-summary-note">
                        Simulated order only — no actual financial transaction. Only your listing and its ordered quantity are included in this detail view.
                    </p>
                </div>
            )}
        </div>
    );
}

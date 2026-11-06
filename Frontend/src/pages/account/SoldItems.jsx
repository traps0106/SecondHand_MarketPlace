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

    return (
        <div style={{ width: '100%' }}>
            {/* Title & Description */}
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#111827' }}>
                Sold items
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0 0 1.5rem 0' }}>
                Review received orders for your secondhand car parts.
            </p>

            {/* Search & Filter Toolbar */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem', width: '100%' }}>
                <div style={{ flex: '1 1 auto' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#111827' }}>
                        Search received orders
                    </label>
                    <input
                        type="text"
                        className="form-input"
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', boxSizing: 'border-box' }}
                        placeholder="Order number, buyer or part name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ width: '200px', flexShrink: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#111827' }}>
                        Order status
                    </label>
                    <select
                        className="form-input"
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All statuses">All statuses</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                <button
                    className="btn-secondary"
                    style={{
                        padding: '0.5rem 1rem',
                        height: '38px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Apply filters
                </button>
            </div>

            {/* Received Orders Table Card */}
            <div className="card" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: '#111827' }}>
                    Received orders
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 1rem 0' }}>
                    3 simulated orders · Newest first · Only orders for your parts are shown
                </p>

                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#4b5563', fontWeight: 600 }}>Order</th>
                            <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#4b5563', fontWeight: 600 }}>Date</th>
                            <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#4b5563', fontWeight: 600 }}>Buyer</th>
                            <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#4b5563', fontWeight: 600 }}>Secondhand car part</th>
                            <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#4b5563', fontWeight: 600 }}>Qty</th>
                            <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#4b5563', fontWeight: 600 }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => {
                            const isSelected = selectedOrder?.id === o.id;
                            return (
                                <tr
                                    key={o.id}
                                    onClick={() => setSelectedOrder(o)}
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? '#e5e7eb' : 'transparent',
                                        borderBottom: '1px solid #e5e7eb',
                                    }}
                                >
                                    <td style={{ padding: '0.75rem', textDecoration: 'underline' }}>{o.id}</td>
                                    <td style={{ padding: '0.75rem' }}>{o.date}</td>
                                    <td style={{ padding: '0.75rem' }}>{o.buyer}</td>
                                    <td style={{ padding: '0.75rem' }}>{o.part}</td>
                                    <td style={{ padding: '0.75rem' }}>{o.qty}</td>
                                    <td style={{ padding: '0.75rem' }}>{o.status}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Footer: Left text & Right Page 1 button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', width: '100%' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Showing 1–3 of 3</span>
                    <button className="btn-secondary" style={{ padding: '0.375rem 0.875rem', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                        Page 1
                    </button>
                </div>
            </div>

            {/* Selected Order Detail Box */}
            {selectedOrder && (
                <div className="card" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.75rem 0', color: '#111827' }}>
                        Order {selectedOrder.id} · Received order details
                    </h2>

                    <p style={{ fontSize: '0.875rem', color: '#111827', margin: '0 0 0.5rem 0' }}>
                        {selectedOrder.part} · {selectedOrder.vehicle} · {selectedOrder.condition} · Quantity: {selectedOrder.qty}
                    </p>

                    <p style={{ fontSize: '0.875rem', color: '#374151', margin: '0 0 1rem 0' }}>
                        Buyer: {selectedOrder.buyer} · Seller: {selectedOrder.seller} · Placed {selectedOrder.date} · {selectedOrder.status}
                    </p>

                    <div
                        style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            color: '#374151',
                            lineHeight: 1.4,
                        }}
                    >
                        Simulated order only — no actual financial transaction. Only your listing and its ordered quantity are included in this detail view.
                    </div>
                </div>
            )}
        </div>
    );
}
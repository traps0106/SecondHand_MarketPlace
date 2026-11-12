import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PARTS, formatBHD, yearRange } from '../../data/parts';

export default function OrderConfirmation() {
    const { state } = useLocation();
    const part = state?.part ?? PARTS[0];
    const qty = state?.qty ?? 1;
    const remaining = Math.max(part.stock - qty, 0);

    return (
        <div>
            <div className="banner banner-success" role="status">
                ✓ Order placed successfully (simulated)
            </div>

            <h2 className="page-heading">Order PM-1043</h2>

            <section className="card" aria-labelledby="order-summary-title">
                <h3 className="card-title" id="order-summary-title">Order summary</h3>
                <p className="summary-line">{part.name} · {yearRange(part)} · {part.id}</p>
                <p className="summary-line">Seller: {part.seller} · Quantity: {qty}</p>
                <p className="summary-line">
                    Total: {formatBHD(part.price * qty)} (simulated, no payment taken)
                </p>
                <p className="summary-line">Status: Processing · Placed 12 Nov 2026</p>
                <p className="summary-line">
                    Stock updated: {remaining} {remaining === 1 ? 'unit' : 'units'} remaining for this listing
                </p>
            </section>

            <div className="delete-actions">
                <Link to="/account/order-history" className="btn-primary btn-link">View order history</Link>
                <Link to="/browse" className="btn-secondary btn-link">Keep browsing</Link>
            </div>
        </div>
    );
}

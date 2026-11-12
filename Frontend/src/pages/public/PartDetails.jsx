import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PARTS, formatBHD, yearRange } from '../../data/parts';
import { isSignedIn } from '../../auth';
import NotFound from './NotFound';

export default function PartDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const part = PARTS.find((p) => p.id === id);
    const [qty, setQty] = useState(1);

    if (!part) return <NotFound />;

    const max = part.stock;
    const outOfStock = max < 1;
    const clamp = (n) => Math.min(Math.max(Number.isNaN(n) ? 1 : n, 1), Math.max(max, 1));

    const placeOrder = () => navigate('/order-confirmation', { state: { part, qty } });

    return (
        <div>
            <p className="page-heading">
                <Link to="/browse" className="text-link">← Back to results</Link>
            </p>

            <div className="details-grid">
                <div className="photo-placeholder photo-large" aria-hidden="true">Part photo</div>

                <div>
                    <h2>{part.name}</h2>
                    <p className="listing-meta">
                        {yearRange(part)} · {part.make} {part.model} · Listing {part.id}
                    </p>
                    <p className="listing-meta">
                        <span className="tag">{part.condition}</span> {outOfStock ? 'Out of stock' : `${part.stock} in stock`}
                    </p>
                    <p className="price-large">{formatBHD(part.price)}</p>

                    <div className="form-group">
                        <label htmlFor="quantity">Quantity</label>
                        <div className="stepper">
                            <button
                                type="button"
                                className="btn-secondary"
                                aria-label="Decrease quantity"
                                onClick={() => setQty(clamp(qty - 1))}
                                disabled={outOfStock || qty <= 1}
                            >
                                −
                            </button>
                            <input
                                id="quantity"
                                type="number"
                                className="form-input stepper-input"
                                min={1}
                                max={max}
                                value={qty}
                                aria-describedby="quantity-hint"
                                onChange={(e) => setQty(clamp(parseInt(e.target.value, 10)))}
                            />
                            <button
                                type="button"
                                className="btn-secondary"
                                aria-label="Increase quantity"
                                onClick={() => setQty(clamp(qty + 1))}
                                disabled={outOfStock || qty >= max}
                            >
                                +
                            </button>
                        </div>
                        <p className="listing-meta" id="quantity-hint">{outOfStock ? 'Currently unavailable' : `Maximum ${max} available`}</p>
                    </div>

                    <div className="delete-actions">
                        {isSignedIn() ? (
                            <button type="button" className="btn-primary" onClick={placeOrder} disabled={outOfStock}>Place order</button>
                        ) : (
                            <Link to="/login" className="btn-primary btn-link">Log in to order</Link>
                        )}
                        <Link to="/browse" className="btn-secondary btn-link">Back to results</Link>
                    </div>

                    <p className="listing-meta" style={{ margin: '1rem 0' }}>
                        Simulated order only — no real payment is taken. Stock is checked when you place the order.
                    </p>

                    <section className="card" aria-labelledby="seller-info-title">
                        <h3 className="card-title" id="seller-info-title">Seller: {part.seller}</h3>
                        <p className="summary-line">Condition: {part.condition}</p>
                        <p className="summary-line">Fits: {yearRange(part)} {part.make} {part.model}</p>
                        <p className="summary-line">Listed: {part.listed}</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

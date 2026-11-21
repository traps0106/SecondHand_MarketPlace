import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatBHD, formatDate, yearRange } from '../../utils/format';
import { getPart } from '../../api/parts';
import { isSignedIn } from '../../auth';
import { addToCart } from '../../api/cart';
import NotFound from './NotFound';

export default function PartDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [part, setPart] = useState(undefined); // undefined = loading, null = not found
    const [loadError, setLoadError] = useState('');
    const [qty, setQty] = useState(1);
    const [cartMsg, setCartMsg] = useState(null);

    useEffect(() => {
        let cancelled = false;
        getPart(id)
            .then((p) => { if (!cancelled) setPart(p); })
            .catch((e) => { if (!cancelled) setLoadError(e.message); });
        return () => { cancelled = true; };
    }, [id]);

    if (loadError) return <div className="banner" role="alert">{loadError}. Make sure the backend is running.</div>;
    if (part === undefined) return <p>Loading part…</p>;
    if (part === null) return <NotFound />;

    const max = part.stock;
    const outOfStock = max < 1;
    const clamp = (n) => Math.min(Math.max(Number.isNaN(n) ? 1 : n, 1), Math.max(max, 1));

    const placeOrder = () => navigate('/order-confirmation', { state: { part, qty } });

    const addToCartClick = async () => {
        try {
            await addToCart(part.id, qty);
            setCartMsg({ ok: true, text: `Added ${qty} to your cart.` });
        } catch (e) {
            setCartMsg({ ok: false, text: e.message });
        }
    };

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
                        {yearRange(part)} · {part.make} {part.model} · Part no. {part.partNumber ?? part.id}
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

                    {cartMsg && (
                        <div className={`banner ${cartMsg.ok ? 'banner-success' : ''}`} role="status">
                            {cartMsg.text} {cartMsg.ok && <Link to="/cart" className="text-link">View cart</Link>}
                        </div>
                    )}

                    <div className="delete-actions">
                        <button type="button" className="btn-secondary" onClick={addToCartClick} disabled={outOfStock}>Add to cart</button>
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
                        <p className="summary-line">Listed: {formatDate(part.listed)}</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

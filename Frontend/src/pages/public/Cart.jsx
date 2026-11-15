import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatBHD, yearRange } from '../../data/parts';
import { clearCart, getCart, removeFromCart, setCartQty } from '../../api/cart';

export default function Cart() {
    const [cart, setCart] = useState(null);
    const [error, setError] = useState('');

    const run = useCallback(async (action) => {
        try {
            setCart(await action());
            setError('');
        } catch (e) {
            setError(e.message);
        }
    }, []);

    useEffect(() => {
        getCart().then(setCart).catch((e) => setError(e.message));
    }, []);

    if (!cart) {
        return error ? <div className="banner" role="alert">{error}</div> : <p>Loading cart…</p>;
    }

    return (
        <div>
            <h2 className="page-heading">Shopping cart</h2>
            {error && <div className="banner" role="alert">{error}</div>}

            {cart.items.length === 0 ? (
                <p>
                    Your cart is empty. <Link to="/browse" className="text-link">Browse parts</Link>
                </p>
            ) : (
                <>
                    {cart.items.map(({ part, qty, lineTotal, stockIssue }) => (
                        <section className="card" key={part.id} aria-label={part.name}>
                            <h3 className="card-title">
                                <Link to={`/parts/${part.id}`} className="text-link">{part.name}</Link>
                            </h3>
                            <p className="summary-line">
                                {yearRange(part)} · {part.make} {part.model} · Seller: {part.seller}
                            </p>
                            <p className="summary-line">{formatBHD(part.price)} each · {part.stock} in stock</p>
                            {stockIssue === 'out_of_stock' && (
                                <p className="summary-line" role="alert">This part is now out of stock — remove it to continue.</p>
                            )}
                            {stockIssue === 'reduced' && (
                                <p className="summary-line" role="alert">Only {part.stock} left, quantity reduced.</p>
                            )}

                            <div className="stepper">
                                <button type="button" className="btn-secondary" aria-label={`Decrease quantity of ${part.name}`}
                                    disabled={qty <= 1} onClick={() => run(() => setCartQty(part.id, qty - 1))}>−</button>
                                <span className="stepper-input" aria-live="polite">{qty}</span>
                                <button type="button" className="btn-secondary" aria-label={`Increase quantity of ${part.name}`}
                                    disabled={qty >= part.stock} onClick={() => run(() => setCartQty(part.id, qty + 1))}>+</button>
                            </div>
                            <p className="summary-line">Subtotal: {formatBHD(lineTotal)}</p>
                            <button type="button" className="btn-secondary" onClick={() => run(() => removeFromCart(part.id))}>
                                Remove
                            </button>
                        </section>
                    ))}

                    <section className="card" aria-labelledby="cart-total-title">
                        <h3 className="card-title" id="cart-total-title">Order total</h3>
                        <p className="summary-line">{cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}</p>
                        <p className="price-large">{formatBHD(cart.total)}</p>
                    </section>

                    <div className="delete-actions">
                        <button type="button" className="btn-secondary" onClick={() => run(clearCart)}>Clear cart</button>
                        <Link to="/browse" className="btn-secondary btn-link">Keep browsing</Link>
                    </div>
                </>
            )}
        </div>
    );
}

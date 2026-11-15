import { API } from './config';

const ID_KEY = 'pm-user-id';

// Placeholder identity until real auth exists: one stable id per browser.
function userId() {
    try {
        let id = localStorage.getItem(ID_KEY);
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem(ID_KEY, id);
        }
        return id;
    } catch {
        return 'anonymous';
    }
}

async function request(path, options = {}) {
    const res = await fetch(`${API}/api/cart${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', 'X-User-Id': userId() },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? 'Cart request failed');
    return body;
}

export const getCart = () => request('');
export const addToCart = (listingId, qty = 1) =>
    request('/items', { method: 'POST', body: JSON.stringify({ listingId, qty }) });
export const setCartQty = (partId, qty) =>
    request(`/items/${encodeURIComponent(partId)}`, { method: 'PATCH', body: JSON.stringify({ qty }) });
export const removeFromCart = (partId) =>
    request(`/items/${encodeURIComponent(partId)}`, { method: 'DELETE' });
export const clearCart = () => request('', { method: 'DELETE' });

import { authHeaders } from '../auth';
import { apiRequest } from './client';

// Seller listing operations. Pages use these functions only, so the data
// source behind them (REST today) can change without touching any page.
const BASE = '/api/seller/listings';

const send = (path, options = {}) => apiRequest(`${BASE}${path}`, { ...options, headers: authHeaders() });

export function listMyListings({ search = '', status = '' } = {}) {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (status) params.set('status', status);
    const query = params.toString();
    return send(query ? `?${query}` : '');
}

export const getMyListing = (id) => send(`/${encodeURIComponent(id)}`);

export const createListing = (listing) => send('', { method: 'POST', body: listing });

// Send only the fields that changed.
export const updateListing = (id, changes) =>
    send(`/${encodeURIComponent(id)}`, { method: 'PATCH', body: changes });

export const updateListingQuantity = (id, quantity) => updateListing(id, { quantity });

export const deleteListing = (id) => send(`/${encodeURIComponent(id)}`, { method: 'DELETE' });

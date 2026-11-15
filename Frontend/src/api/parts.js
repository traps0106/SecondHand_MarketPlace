import { API } from './config';

export async function getParts() {
    const res = await fetch(`${API}/api/parts`);
    if (!res.ok) throw new Error('Could not load parts');
    return res.json();
}

// Resolves to null when the part does not exist.
export async function getPart(id) {
    const res = await fetch(`${API}/api/parts/${encodeURIComponent(id)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Could not load part');
    return res.json();
}

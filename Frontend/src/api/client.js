import { API } from './config';

// Error thrown for any non-2xx response. `details` holds per-field
// validation messages when the server sends them.
export class ApiError extends Error {
    constructor(message, status, details) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details ?? null;
    }
}

// Single place where the app talks HTTP. Pages call the functions in
// src/api/* and never fetch directly, so the transport can change freely.
export async function apiRequest(path, { method = 'GET', body, headers } = {}) {
    const res = await fetch(`${API}${path}`, {
        method,
        headers: {
            ...(body !== undefined && { 'Content-Type': 'application/json' }),
            ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) return null;

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status, data.details);
    return data;
}

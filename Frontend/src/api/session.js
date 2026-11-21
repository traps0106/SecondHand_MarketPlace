import { apiRequest } from './client';

// Resolves an email to an account. Replaced by a real login call once
// password authentication is implemented.
export const createSession = (email) =>
    apiRequest('/api/session', { method: 'POST', body: { email } });

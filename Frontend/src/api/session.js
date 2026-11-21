import { apiRequest } from './client';

// POST /api/auth/login -> { token, user }
export const login = (email, password) =>
    apiRequest('/api/auth/login', { method: 'POST', body: { email, password } });

// POST /api/auth/register. The account is always created as a normal user.
export const register = ({ name, email, password, accountType }) =>
    apiRequest('/api/auth/register', { method: 'POST', body: { name, email, password, accountType } });

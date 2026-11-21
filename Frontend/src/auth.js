// Client-side session: the account and JWT returned by POST /api/auth/login.
// Kept in sessionStorage (cleared when the tab closes). The role here is only
// for choosing what to show; the API re-checks it on every request.
const KEY = 'pm-session';
const TOKEN_KEY = 'pm-token';

export function getCurrentUser() {
    try {
        const raw = sessionStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : null; // { id, name, email, role }
    } catch {
        return null;
    }
}

export const getRole = () => getCurrentUser()?.role ?? null;
export const isSignedIn = () => getCurrentUser() !== null;
export const isAdmin = () => getRole() === 'admin';

export function getToken() {
    try {
        return sessionStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

// Headers that identify the caller to the API.
export function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export function signIn(user, token) {
    try {
        sessionStorage.setItem(KEY, JSON.stringify(user));
        sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
        /* storage unavailable */
    }
}

export function signOut() {
    try {
        sessionStorage.removeItem(KEY);
        sessionStorage.removeItem(TOKEN_KEY);
    } catch {
        /* storage unavailable */
    }
}

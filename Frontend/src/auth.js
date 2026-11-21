// Client-side session: the account returned by the API at sign-in.
// TEMPORARY until token-based auth exists; callers only use the helpers below,
// so switching to a JWT means changing this file and api/session.js.
const KEY = 'pm-session';

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

// Headers that identify the caller to the API.
export function authHeaders() {
    const user = getCurrentUser();
    return user ? { 'X-User-Id': user.id } : {};
}

export function signIn(user) {
    try {
        sessionStorage.setItem(KEY, JSON.stringify(user));
    } catch {
        /* storage unavailable */
    }
}

export function signOut() {
    try {
        sessionStorage.removeItem(KEY);
    } catch {
        /* storage unavailable */
    }
}

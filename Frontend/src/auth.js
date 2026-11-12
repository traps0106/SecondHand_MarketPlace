// Placeholder session helper for the front-end skeleton (no real auth yet).
const KEY = 'pm-signed-in';

export function getRole() {
    try {
        return sessionStorage.getItem(KEY); // 'user' | 'admin' | null
    } catch {
        return null;
    }
}

export const isSignedIn = () => getRole() !== null;
export const isAdmin = () => getRole() === 'admin';

export function signIn(role = 'user') {
    try {
        sessionStorage.setItem(KEY, role);
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

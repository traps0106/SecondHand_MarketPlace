// Placeholder session helper for the front-end skeleton (no real auth yet).
const KEY = 'pm-signed-in';

export function isSignedIn() {
    try {
        return sessionStorage.getItem(KEY) === '1';
    } catch {
        return false;
    }
}

export function signIn() {
    try {
        sessionStorage.setItem(KEY, '1');
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

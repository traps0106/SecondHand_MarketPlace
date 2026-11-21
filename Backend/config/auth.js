// Authentication settings. Secrets come from the environment only.

export const ROLES = Object.freeze({ USER: "user", ADMIN: "admin" });
export const ACCOUNT_TYPES = Object.freeze({ BUYER: "buyer", SELLER: "seller" });
export const USER_STATUS = Object.freeze({ ACTIVE: "active", SUSPENDED: "suspended" });

export const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;
export const JWT_ISSUER = "secondhand-marketplace";

// Read lazily so dotenv has loaded; a missing secret fails loudly at startup.
export function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error("JWT_SECRET must be set to a random string of at least 32 characters");
    }
    return secret;
}

export const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || "1h";

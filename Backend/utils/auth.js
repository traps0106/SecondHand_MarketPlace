import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { BCRYPT_ROUNDS, JWT_ISSUER, getJwtExpiresIn, getJwtSecret } from "../config/auth.js";

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS);

// Compared against when the account does not exist, so response time does not
// reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_ROUNDS);

export async function verifyPassword(password, hash) {
    // Legacy seed rows hold placeholders such as "MOCK_HASH_001"; those never match.
    const isBcrypt = typeof hash === "string" && hash.startsWith("$2");
    const matches = await bcrypt.compare(password, isBcrypt ? hash : DUMMY_HASH);
    return isBcrypt && matches;
}

// The token carries only the user id. Role and status are read from the
// database on every request, so promotions, demotions and suspensions apply
// immediately and a token can never grant more than the account has.
export function signToken(userId) {
    return jwt.sign({}, getJwtSecret(), {
        subject: userId.toString(),
        issuer: JWT_ISSUER,
        expiresIn: getJwtExpiresIn(),
        algorithm: "HS256",
    });
}

// Returns the payload, or null for any invalid, expired or tampered token.
export function verifyToken(token) {
    try {
        return jwt.verify(token, getJwtSecret(), { issuer: JWT_ISSUER, algorithms: ["HS256"] });
    } catch {
        return null;
    }
}

// Returns an error message, or null when the password is acceptable.
export function validatePassword(password) {
    if (typeof password !== "string") return "Password is required";
    if (password.length < 8) return "Use at least 8 characters";
    if (Buffer.byteLength(password) > 72) return "Password is too long (72 bytes at most)";
    return null;
}

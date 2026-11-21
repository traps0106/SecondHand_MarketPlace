import { USER_STATUS } from "../config/auth.js";
import { findUserById, toPublicUser } from "../repositories/users.js";
import { verifyToken } from "../utils/auth.js";
import { toObjectId } from "../utils/listings.js";

// Authenticates the request from "Authorization: Bearer <jwt>" and sets
// req.user = { _id, id, name, email, role, accountType, status }.
//
// Identity comes only from the verified token; headers or body fields such as
// X-User-Id or "role" are never trusted. The account is reloaded from MongoDB
// on each request, so the role in effect is always the stored one.
// Missing or invalid token -> 401. Suspended account -> 403.
export async function requireUser(req, res, next) {
    const [scheme, token] = (req.get("authorization") ?? "").split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) {
        return res.status(401).json({ error: "Sign in to continue" });
    }

    const payload = verifyToken(token);
    const _id = toObjectId(payload?.sub);
    if (!_id) return res.status(401).json({ error: "Invalid or expired token. Sign in again." });

    const user = await findUserById(_id);
    if (!user) return res.status(401).json({ error: "Account not found. Sign in again." });

    const publicUser = toPublicUser(user);
    if (publicUser.status === USER_STATUS.SUSPENDED) {
        return res.status(403).json({ error: "This account is suspended" });
    }

    req.user = { _id: user._id, ...publicUser };
    next();
}

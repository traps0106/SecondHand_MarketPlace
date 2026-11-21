import { findUserById, toPublicUser } from "../repositories/users.js";
import { toObjectId } from "../utils/listings.js";

// Resolves the caller into req.user = { _id, id, name, email, role }.
//
// TEMPORARY: identity comes from the X-User-Id header (a users._id) until
// real authentication lands. When JWT is added, only this middleware changes:
// verify the token, then load the same user. Routes depend on req.user only.
export async function requireUser(req, res, next) {
    const _id = toObjectId(req.get("x-user-id"));
    if (!_id) return res.status(401).json({ error: "Sign in to continue" });

    const user = await findUserById(_id);
    if (!user) return res.status(401).json({ error: "Account not found. Sign in again." });

    req.user = { _id: user._id, ...toPublicUser(user) };
    next();
}

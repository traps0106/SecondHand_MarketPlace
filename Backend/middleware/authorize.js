import { ROLES } from "../config/auth.js";
import { findListingOwner } from "../repositories/adminListings.js";

// Use after requireUser. Allows only the listed roles, otherwise 403.
export const requireRole =
    (...roles) =>
    (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: "Sign in to continue" });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "You do not have permission to do this" });
        }
        next();
    };

export const requireAdmin = requireRole(ROLES.ADMIN);

// Use after requireUser and a router.param that sets req.listingId.
// Lets the request through only for the listing's seller or an admin:
// unknown listing -> 404, someone else's listing -> 403.
export async function requireListingOwnerOrAdmin(req, res, next) {
    const sellerId = await findListingOwner(req.listingId);
    if (!sellerId) return res.status(404).json({ error: "Listing not found" });

    const isOwner = sellerId.equals(req.user._id);
    if (!isOwner && req.user.role !== ROLES.ADMIN) {
        return res.status(403).json({ error: "You can only change your own listings" });
    }
    next();
}

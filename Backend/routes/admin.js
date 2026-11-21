import { Router } from "express";
import { ACCOUNT_TYPES, ROLES, USER_STATUS } from "../config/auth.js";
import { LISTING_STATUS } from "../config/referenceData.js";
import { requireUser } from "../middleware/currentUser.js";
import { requireAdmin } from "../middleware/authorize.js";
import { deleteAnyListing, findAllListings, updateAnyListing } from "../repositories/adminListings.js";
import {
    countActiveAdmins,
    deleteUser,
    findUserById,
    listUsers,
    toPublicUser,
    updateUser,
} from "../repositories/users.js";
import { hashPassword, validatePassword } from "../utils/auth.js";
import { toObjectId } from "../utils/listings.js";
import { LISTING_FIELDS, validateListing } from "../validators/listing.js";

// /api/admin/*: administrators only (401 without a valid token, 403 for non-admins).
const router = Router();

router.use(requireUser, requireAdmin);

const oneOf = (values) => (raw) => Object.values(values).includes(raw);

router.param("id", (req, res, next, id) => {
    req.targetId = toObjectId(id);
    if (!req.targetId) return res.status(400).json({ error: "Invalid id" });
    next();
});

// ---- Users ----

router.get("/users", async (req, res) => {
    const items = (await listUsers()).map(toPublicUser);
    res.json({ items, total: items.length });
});

router.get("/users/:id", async (req, res) => {
    const user = await findUserById(req.targetId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(toPublicUser(user));
});

// PATCH /api/admin/users/:id  { name?, role?, accountType?, status?, password? }
// The only way to change a role. An admin cannot demote or suspend themselves.
router.patch("/users/:id", async (req, res) => {
    const body = req.body ?? {};
    const changes = {};
    const errors = {};

    if (body.name !== undefined) {
        if (typeof body.name === "string" && body.name.trim() && body.name.trim().length <= 100) {
            changes.name = body.name.trim();
        } else errors.name = "Name must be 1-100 characters";
    }
    if (body.role !== undefined) {
        if (oneOf(ROLES)(body.role)) changes.role = body.role;
        else errors.role = `Must be one of: ${Object.values(ROLES).join(", ")}`;
    }
    if (body.accountType !== undefined) {
        if (oneOf(ACCOUNT_TYPES)(body.accountType)) changes.accountType = body.accountType;
        else errors.accountType = `Must be one of: ${Object.values(ACCOUNT_TYPES).join(", ")}`;
    }
    if (body.status !== undefined) {
        if (oneOf(USER_STATUS)(body.status)) changes.status = body.status;
        else errors.status = `Must be one of: ${Object.values(USER_STATUS).join(", ")}`;
    }
    if (body.password !== undefined) {
        const passwordError = validatePassword(body.password);
        if (passwordError) errors.password = passwordError;
        else changes.passwordHash = await hashPassword(body.password);
    }

    if (Object.keys(errors).length) {
        return res.status(400).json({ error: "Some fields are invalid", details: errors });
    }
    if (!Object.keys(changes).length) return res.status(400).json({ error: "Nothing to update" });

    const target = await findUserById(req.targetId);
    if (!target) return res.status(404).json({ error: "User not found" });

    const demoting = changes.role === ROLES.USER || changes.status === USER_STATUS.SUSPENDED;
    if (demoting && toPublicUser(target).role === ROLES.ADMIN) {
        if (target._id.equals(req.user._id)) {
            return res.status(400).json({ error: "You cannot remove your own admin access" });
        }
        if ((await countActiveAdmins()) <= 1) {
            return res.status(400).json({ error: "At least one active admin must remain" });
        }
    }

    res.json(await updateUser(req.targetId, changes));
});

router.delete("/users/:id", async (req, res) => {
    if (req.targetId.equals(req.user._id)) {
        return res.status(400).json({ error: "You cannot delete your own account" });
    }
    const target = await findUserById(req.targetId);
    if (!target) return res.status(404).json({ error: "User not found" });
    if (toPublicUser(target).role === ROLES.ADMIN && (await countActiveAdmins()) <= 1) {
        return res.status(400).json({ error: "At least one active admin must remain" });
    }
    await deleteUser(req.targetId);
    res.status(204).end();
});

// ---- Listings (all sellers) ----

const STATUSES = new Set(Object.values(LISTING_STATUS));

router.get("/listings", async (req, res) => {
    const { status = "" } = req.query;
    if (typeof status !== "string" || (status && !STATUSES.has(status))) {
        return res.status(400).json({ error: "Unknown status filter" });
    }
    const items = await findAllListings({ status });
    res.json({ items, total: items.length });
});

// PATCH /api/admin/listings/:id  — listing fields and/or moderation `status`.
router.patch("/listings/:id", async (req, res) => {
    // A body with only `status` (approve/reject) has no listing fields to validate.
    const hasFields = LISTING_FIELDS.some((field) => field in (req.body ?? {}));
    const { value, errors } = hasFields ? validateListing(req.body, { partial: true }) : { value: {}, errors: {} };
    const status = req.body?.status;
    if (status !== undefined) {
        if (typeof status === "string" && STATUSES.has(status)) value.status = status;
        else errors.status = `Must be one of: ${[...STATUSES].join(", ")}`;
    }
    if (Object.keys(errors).length) {
        return res.status(400).json({ error: "Some fields are invalid", details: errors });
    }
    if (!Object.keys(value).length) return res.status(400).json({ error: "Nothing to update" });

    const listing = await updateAnyListing(req.targetId, value);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
});

router.delete("/listings/:id", async (req, res) => {
    if (!(await deleteAnyListing(req.targetId))) return res.status(404).json({ error: "Listing not found" });
    res.status(204).end();
});

export default router;

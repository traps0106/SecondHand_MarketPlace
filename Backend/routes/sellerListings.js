import { Router } from "express";
import { LISTING_STATUS } from "../config/referenceData.js";
import { requireUser } from "../middleware/currentUser.js";
import {
    createSellerListing,
    deleteSellerListing,
    findSellerListing,
    findSellerListings,
    updateSellerListing,
} from "../repositories/sellerListings.js";
import { toObjectId } from "../utils/listings.js";
import { validateListing } from "../validators/listing.js";

// Seller-facing CRUD for the caller's own listings: /api/seller/listings
const router = Router();

router.use(requireUser);

const STATUSES = new Set(Object.values(LISTING_STATUS));
const MAX_SEARCH_LENGTH = 100;

// Turns :id into an ObjectId once, for every route that takes it.
router.param("id", (req, res, next, id) => {
    req.listingId = toObjectId(id);
    if (!req.listingId) return res.status(400).json({ error: "Invalid listing id" });
    next();
});

// GET /api/seller/listings?search=&status=
router.get("/", async (req, res) => {
    const { search = "", status = "" } = req.query;
    if (typeof search !== "string" || search.length > MAX_SEARCH_LENGTH) {
        return res.status(400).json({ error: `search must be text of at most ${MAX_SEARCH_LENGTH} characters` });
    }
    if (typeof status !== "string" || (status && !STATUSES.has(status))) {
        return res.status(400).json({ error: "Unknown status filter" });
    }

    const items = await findSellerListings(req.user._id, { search: search.trim(), status });
    res.json({ items, total: items.length });
});

// POST /api/seller/listings
router.post("/", async (req, res) => {
    const { value, errors } = validateListing(req.body);
    if (Object.keys(errors).length) {
        return res.status(400).json({ error: "Some fields are invalid", details: errors });
    }

    const listing = await createSellerListing(req.user._id, value);
    res.status(201).location(`${req.baseUrl}/${listing.id}`).json(listing);
});

// GET /api/seller/listings/:id
// Another seller's listing returns 404, so ids of other sellers are not revealed.
router.get("/:id", async (req, res) => {
    const listing = await findSellerListing(req.user._id, req.listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
});

// PATCH /api/seller/listings/:id  (send only the fields that change)
// A quantity-only update (Inventory page) keeps the listing live; any other
// change sends it back to review.
router.patch("/:id", async (req, res) => {
    const { value, errors } = validateListing(req.body, { partial: true });
    if (Object.keys(errors).length) {
        return res.status(400).json({ error: "Some fields are invalid", details: errors });
    }

    const listing = await updateSellerListing(req.user._id, req.listingId, value);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
});

// DELETE /api/seller/listings/:id
router.delete("/:id", async (req, res) => {
    const deleted = await deleteSellerListing(req.user._id, req.listingId);
    if (!deleted) return res.status(404).json({ error: "Listing not found" });
    res.status(204).end();
});

export default router;

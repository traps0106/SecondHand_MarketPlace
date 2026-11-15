import { Router } from "express";
import { getDB } from "../config/db.js";
import { findParts, findPartById, toObjectId } from "../utils/listings.js";

const router = Router();

// No real auth yet: the frontend sends a per-browser id in X-User-Id.
// Swap this middleware for real session/JWT auth later; routes only use req.userId.
router.use((req, res, next) => {
    const id = req.get("x-user-id");
    if (!id || id.length > 100) {
        return res.status(401).json({ error: "Missing X-User-Id header" });
    }
    req.userId = id;
    next();
});

const carts = () => getDB().collection("carts");

function parseQty(value) {
    const qty = Number(value);
    return Number.isInteger(qty) && qty >= 1 ? qty : null;
}

// Cart lines link to the `listings` collection by listingId (ObjectId).
// Price and stock are joined in live so they are always server-truth.
async function buildCart(userId) {
    const cart = await carts().findOne({ userId });
    const lines = (cart?.items ?? []).filter((l) => l.listingId);
    const found = lines.length
        ? await findParts({ _id: { $in: lines.map((l) => l.listingId) } })
        : [];
    const byId = new Map(found.map((p) => [p.id, p]));

    const items = lines
        .map((l) => {
            const part = byId.get(l.listingId.toString());
            if (!part) return null; // listing was deleted
            const qty = Math.min(l.qty, part.stock);
            return {
                part,
                qty,
                lineTotal: part.price * qty,
                // Stock dropped (or the listing was deactivated) since it was added.
                stockIssue: part.stock < 1 ? "out_of_stock" : l.qty > part.stock ? "reduced" : null,
            };
        })
        .filter(Boolean);

    return {
        items,
        itemCount: items.reduce((n, i) => n + i.qty, 0),
        total: items.reduce((n, i) => n + i.lineTotal, 0),
    };
}

router.get("/", async (req, res) => {
    res.json(await buildCart(req.userId));
});

// Add a listing (or increase its quantity if already in the cart).
router.post("/items", async (req, res) => {
    const listingId = toObjectId(req.body?.listingId);
    const qty = parseQty(req.body?.qty ?? 1);
    if (!listingId || qty === null) {
        return res.status(400).json({ error: "A valid listingId and a positive integer qty are required" });
    }

    const part = await findPartById(listingId.toString());
    if (!part) return res.status(404).json({ error: "Listing not found" });
    if (part.stock < 1) return res.status(409).json({ error: "Part is out of stock" });

    const cart = await carts().findOne({ userId: req.userId });
    const existing = cart?.items.find((i) => i.listingId?.equals(listingId))?.qty ?? 0;
    const newQty = existing + qty;
    if (newQty > part.stock) {
        return res.status(409).json({
            error: `Only ${part.stock} in stock (${existing} already in your cart)`,
        });
    }

    if (existing) {
        await carts().updateOne(
            { userId: req.userId, "items.listingId": listingId },
            { $set: { "items.$.qty": newQty, updatedAt: new Date() } }
        );
    } else {
        await carts().updateOne(
            { userId: req.userId },
            { $push: { items: { listingId, qty: newQty } }, $set: { updatedAt: new Date() } },
            { upsert: true }
        );
    }
    res.status(201).json(await buildCart(req.userId));
});

// Set an exact quantity for a line.
router.patch("/items/:listingId", async (req, res) => {
    const qty = parseQty(req.body?.qty);
    if (qty === null) return res.status(400).json({ error: "qty must be a positive integer" });

    const listingId = toObjectId(req.params.listingId);
    if (!listingId) return res.status(400).json({ error: "Invalid listing id" });

    const part = await findPartById(listingId.toString());
    if (!part) return res.status(404).json({ error: "Listing not found" });
    if (qty > part.stock) return res.status(409).json({ error: `Only ${part.stock} in stock` });

    const result = await carts().updateOne(
        { userId: req.userId, "items.listingId": listingId },
        { $set: { "items.$.qty": qty, updatedAt: new Date() } }
    );
    if (!result.matchedCount) return res.status(404).json({ error: "Item not in cart" });
    res.json(await buildCart(req.userId));
});

router.delete("/items/:listingId", async (req, res) => {
    const listingId = toObjectId(req.params.listingId);
    if (!listingId) return res.status(400).json({ error: "Invalid listing id" });
    await carts().updateOne(
        { userId: req.userId },
        { $pull: { items: { listingId } }, $set: { updatedAt: new Date() } }
    );
    res.json(await buildCart(req.userId));
});

router.delete("/", async (req, res) => {
    await carts().deleteOne({ userId: req.userId });
    res.json(await buildCart(req.userId));
});

export default router;

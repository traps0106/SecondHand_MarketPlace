import { Router } from "express";
import { requireUser } from "../middleware/currentUser.js";
import { PurchaseError, findOrdersByBuyer, placeOrder } from "../repositories/orders.js";
import { toObjectId } from "../utils/listings.js";

// /api/orders: buying parts and the signed-in buyer's order history.
const router = Router();

router.use(requireUser);

const MAX_LINES = 20;
const MAX_QUANTITY = 100;

// Reads { items: [{ listingId, quantity }] }. The buyer always comes from the
// JWT, and price and title always come from the database, never from the body.
// Repeated listings are merged into one line.
function parseLines(body) {
    const items = body?.items;
    if (!Array.isArray(items) || items.length < 1 || items.length > MAX_LINES) {
        return { error: `items must be a list of 1-${MAX_LINES} lines` };
    }

    const merged = new Map();
    for (const item of items) {
        const listingId = toObjectId(item?.listingId);
        const quantity = item?.quantity ?? 1;
        if (!listingId || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
            return { error: `Each line needs a valid listingId and a whole quantity of 1-${MAX_QUANTITY}` };
        }
        const key = listingId.toString();
        const total = (merged.get(key)?.quantity ?? 0) + quantity;
        if (total > MAX_QUANTITY) return { error: `At most ${MAX_QUANTITY} of one listing per order` };
        merged.set(key, { listingId, quantity: total });
    }
    return { lines: [...merged.values()] };
}

// POST /api/orders  { items: [{ listingId, quantity }] }
// 201 order | 400 bad input | 401 | 403 own listing | 404 gone | 409 not enough stock
router.post("/", async (req, res) => {
    const { lines, error } = parseLines(req.body);
    if (error) return res.status(400).json({ error });

    try {
        const order = await placeOrder(req.user._id, lines);
        res.status(201).location(`${req.baseUrl}/${order.id}`).json(order);
    } catch (err) {
        if (err instanceof PurchaseError) return res.status(err.status).json({ error: err.message });
        throw err; // anything else is a 500 via the app error handler
    }
});

// GET /api/orders  — the caller's own orders, newest first.
router.get("/", async (req, res) => {
    const items = await findOrdersByBuyer(req.user._id);
    res.json({ items, total: items.length });
});

export default router;

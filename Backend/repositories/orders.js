import { Decimal128 } from "mongodb";
import { getClient, getDB } from "../config/db.js";

// Purchases. Stock lives in listings.quantity; orders use the existing `orders`
// document shape: { buyerId, items: [{ listingId, title, quantity, unitPrice }],
// totalAmount, status, createdAt } with Decimal128 money.

const listings = () => getDB().collection("listings");
const orders = () => getDB().collection("orders");

// A purchase the buyer cannot complete (missing listing, not enough stock, ...).
// `status` is the HTTP status the route should answer with.
export class PurchaseError extends Error {
    constructor(status, message) {
        super(message);
        this.name = "PurchaseError";
        this.status = status;
    }
}

// Orders start "pending" (the seller has not fulfilled them yet); no payment is taken.
export const NEW_ORDER_STATUS = "pending";

const TRANSACTION_OPTIONS = {
    readConcern: { level: "snapshot" },
    writeConcern: { w: "majority" },
    readPreference: "primary",
};
const TRANSACTION_TIMEOUT_MS = 15_000;

const toMilli = (decimal) => Math.round(Number(decimal.toString()) * 1000);
const fromMilli = (milli) => Decimal128.fromString((milli / 1000).toFixed(3));

export function toOrder(doc) {
    return {
        id: doc._id.toString(),
        buyerId: doc.buyerId.toString(),
        items: doc.items.map((item) => ({
            listingId: item.listingId.toString(),
            title: item.title,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice.toString()),
            lineTotal: toMilli(item.unitPrice) * item.quantity / 1000,
        })),
        totalAmount: Number(doc.totalAmount.toString()),
        status: doc.status,
        createdAt: doc.createdAt,
    };
}

// Buys `lines` ([{ listingId: ObjectId, quantity }], one line per listing) for
// `buyerId` as ONE all-or-nothing transaction:
//
//   1. for each line, atomically decrement stock only if the listing is active
//      and still has enough: findOneAndUpdate({ _id, status: "active",
//      quantity: { $gte: n } }, { $inc: { quantity: -n } })
//   2. insert the order
//   3. commit
//
// Any failure aborts the transaction, so stock is never reduced without an
// order and an order never exists without the stock being taken.
//
// Concurrency: the conditional update is atomic per document, so two buyers can
// never both take the last unit. When two transactions touch the same listing at
// once, MongoDB aborts one with a TransientTransactionError (write conflict);
// session.withTransaction retries it from the start, where it now sees the
// reduced stock and is rejected with a PurchaseError. Commit results that are
// unknown are retried by withTransaction as well.
export async function placeOrder(buyerId, lines) {
    const session = getClient().startSession();
    try {
        const order = await session.withTransaction(async () => {
            const items = [];
            let totalMilli = 0;

            for (const { listingId, quantity } of lines) {
                const listing = await listings().findOneAndUpdate(
                    { _id: listingId, status: "active", quantity: { $gte: quantity } },
                    { $inc: { quantity: -quantity }, $set: { updatedAt: new Date() } },
                    { session, returnDocument: "after" }
                );

                if (!listing) {
                    // Work out why, for a useful message (read inside the same snapshot).
                    const current = await listings().findOne({ _id: listingId }, { session });
                    if (!current || current.status !== "active") {
                        throw new PurchaseError(404, "Listing not found or no longer available");
                    }
                    throw new PurchaseError(
                        409,
                        current.quantity > 0
                            ? `Only ${current.quantity} of "${current.title}" left`
                            : `"${current.title}" is no longer available`
                    );
                }
                if (listing.sellerId.equals(buyerId)) {
                    throw new PurchaseError(403, "You cannot buy your own listing");
                }

                items.push({ listingId, title: listing.title, quantity, unitPrice: listing.price });
                totalMilli += toMilli(listing.price) * quantity;
            }

            const doc = {
                buyerId,
                items,
                totalAmount: fromMilli(totalMilli),
                status: NEW_ORDER_STATUS,
                createdAt: new Date(),
            };
            const { insertedId } = await orders().insertOne(doc, { session });
            return { ...doc, _id: insertedId };
        }, { ...TRANSACTION_OPTIONS, timeoutMS: TRANSACTION_TIMEOUT_MS });

        return toOrder(order);
    } finally {
        await session.endSession();
    }
}

export async function findOrdersByBuyer(buyerId) {
    const docs = await orders().find({ buyerId }).sort({ createdAt: -1 }).toArray();
    return docs.map(toOrder);
}

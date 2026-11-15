import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

// Returns an ObjectId, or null when the string is not a valid id.
export function toObjectId(value) {
    if (value instanceof ObjectId) return value;
    return typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value) ? new ObjectId(value) : null;
}

// Shape a `listings` document the way the frontend expects a part.
// Only the seller display name is taken from `users` (never email or passwordHash).
function toPart(listing, sellerNames) {
    return {
        id: listing._id.toString(),
        name: listing.title,
        make: listing.vehicleMake,
        model: listing.vehicleModel,
        yearFrom: listing.vehicleYear,
        yearTo: listing.vehicleYear,
        category: listing.category,
        condition: listing.condition,
        price: Number(listing.price.toString()), // stored as Decimal128
        // A listing that is not active cannot be bought, whatever its quantity says.
        stock: listing.status === "active" ? listing.quantity : 0,
        seller: sellerNames.get(listing.sellerId.toString()) ?? "Unknown seller",
        sellerId: listing.sellerId.toString(),
        listed: listing.createdAt,
        description: listing.description,
        partNumber: listing.partNumber,
        partType: listing.partType,
        engineType: listing.engineType,
        status: listing.status,
    };
}

export async function findParts(filter = {}) {
    const db = getDB();
    const listings = await db.collection("listings").find(filter).sort({ createdAt: -1 }).toArray();
    const sellerIds = [...new Map(listings.map((l) => [l.sellerId.toString(), l.sellerId])).values()];
    const sellers = sellerIds.length
        ? await db.collection("users").find({ _id: { $in: sellerIds } }, { projection: { name: 1 } }).toArray()
        : [];
    const sellerNames = new Map(sellers.map((u) => [u._id.toString(), u.name]));
    return listings.map((l) => toPart(l, sellerNames));
}

export const findActiveParts = () => findParts({ status: "active" });

export async function findPartById(id, { activeOnly = true } = {}) {
    const _id = toObjectId(id);
    if (!_id) return null;
    const [part] = await findParts(activeOnly ? { _id, status: "active" } : { _id });
    return part ?? null;
}

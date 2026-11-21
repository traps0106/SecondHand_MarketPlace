import { Decimal128 } from "mongodb";
import { LISTING_STATUS } from "../config/referenceData.js";
import { getDB } from "../config/db.js";

// Data access for a seller's own listings. Every query is scoped by sellerId,
// so a seller can never read or change another seller's documents.
// This is the only module that knows how listings are stored in MongoDB.

const listings = () => getDB().collection("listings");

export function ensureSellerListingIndexes() {
    return listings().createIndex({ sellerId: 1, createdAt: -1 });
}

// Stored document -> API shape (the same field names the UI uses for parts).
export function toSellerListing(doc) {
    return {
        id: doc._id.toString(),
        name: doc.title,
        category: doc.category,
        condition: doc.condition,
        make: doc.vehicleMake,
        model: doc.vehicleModel,
        year: doc.vehicleYear,
        price: Number(doc.price?.toString() ?? 0), // Decimal128 in storage
        quantity: doc.quantity,
        status: doc.status,
        description: doc.description ?? "",
        partNumber: doc.partNumber ?? "",
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt ?? doc.createdAt,
    };
}

// API field -> stored field. Validated input is mapped through this, so the
// storage schema can change without touching routes or the UI.
const STORAGE_FIELDS = {
    name: "title",
    category: "category",
    condition: "condition",
    make: "vehicleMake",
    model: "vehicleModel",
    year: "vehicleYear",
    price: "price",
    quantity: "quantity",
    description: "description",
    partNumber: "partNumber",
};

export function toListingDocument(input) {
    const doc = {};
    for (const [field, value] of Object.entries(input)) {
        const key = STORAGE_FIELDS[field];
        if (!key) continue;
        doc[key] = field === "price" ? Decimal128.fromString(value) : value;
    }
    return doc;
}

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function findSellerListings(sellerId, { search, status } = {}) {
    const filter = { sellerId };
    if (status) filter.status = status;
    if (search) {
        const pattern = new RegExp(escapeRegex(search), "i");
        filter.$or = [
            { title: pattern },
            { vehicleMake: pattern },
            { vehicleModel: pattern },
            { partNumber: pattern },
        ];
    }

    const docs = await listings().find(filter).sort({ createdAt: -1 }).toArray();
    return docs.map(toSellerListing);
}

export async function findSellerListing(sellerId, _id) {
    const doc = await listings().findOne({ _id, sellerId });
    return doc ? toSellerListing(doc) : null;
}

// New listings always start in review; sellers cannot publish directly.
export async function createSellerListing(sellerId, input) {
    const now = new Date();
    const doc = {
        ...toListingDocument(input),
        sellerId,
        status: LISTING_STATUS.PENDING,
        createdAt: now,
        updatedAt: now,
    };
    const { insertedId } = await listings().insertOne(doc);
    return toSellerListing({ ...doc, _id: insertedId });
}

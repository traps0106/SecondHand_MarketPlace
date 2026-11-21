import { getDB } from "../config/db.js";
import { removeFromCarts, toListingDocument, toSellerListing } from "./sellerListings.js";

// Listing access that is not limited to one seller: ownership checks and the
// admin endpoints. Seller routes keep using sellerListings.js.

const listings = () => getDB().collection("listings");

const toAdminListing = (doc) => ({ ...toSellerListing(doc), sellerId: doc.sellerId?.toString() ?? null });

export async function findListingOwner(_id) {
    const doc = await listings().findOne({ _id }, { projection: { sellerId: 1 } });
    return doc?.sellerId ?? null;
}

export async function findAllListings({ status } = {}) {
    const docs = await listings().find(status ? { status } : {}).sort({ createdAt: -1 }).toArray();
    return docs.map(toAdminListing);
}

// `input` holds validated listing fields and optionally `status` (moderation).
export async function updateAnyListing(_id, input) {
    const { status, ...fields } = input;
    const set = { ...toListingDocument(fields), updatedAt: new Date() };
    if (status) set.status = status;
    const doc = await listings().findOneAndUpdate({ _id }, { $set: set }, { returnDocument: "after" });
    return doc ? toAdminListing(doc) : null;
}

export async function deleteAnyListing(_id) {
    const { deletedCount } = await listings().deleteOne({ _id });
    if (!deletedCount) return false;
    await removeFromCarts(_id);
    return true;
}

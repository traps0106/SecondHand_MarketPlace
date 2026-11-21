import { getDB } from "../config/db.js";

const users = () => getDB().collection("users");

// Fields that are safe to send to clients. Never expose passwordHash.
const PUBLIC_FIELDS = { name: 1, email: 1, role: 1 };

export function toPublicUser(doc) {
    return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        role: doc.role === "admin" ? "admin" : "user",
    };
}

// Case-insensitive match, so "Seller@Example.com" finds "seller@example.com".
export function findUserByEmail(email) {
    return users().findOne(
        { email },
        { projection: PUBLIC_FIELDS, collation: { locale: "en", strength: 2 } }
    );
}

export function findUserById(_id) {
    return users().findOne({ _id }, { projection: PUBLIC_FIELDS });
}

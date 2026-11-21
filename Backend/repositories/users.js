import { ACCOUNT_TYPES, ROLES, USER_STATUS } from "../config/auth.js";
import { getDB } from "../config/db.js";

const users = () => getDB().collection("users");

const CASE_INSENSITIVE = { locale: "en", strength: 2 };

// Fields that are safe to send to clients. passwordHash is excluded from every
// projection except the one login uses.
const PUBLIC_FIELDS = { name: 1, email: 1, role: 1, accountType: 1, status: 1, createdAt: 1 };

// Authorization role (admin | user) and account type (buyer | seller) are
// separate fields. Older records stored the account type in `role`
// ("buyer" | "seller" | "admin"); both shapes are read here, so no migration is needed.
export const roleOf = (doc) => (doc.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.USER);

export function accountTypeOf(doc) {
    if (Object.values(ACCOUNT_TYPES).includes(doc.accountType)) return doc.accountType;
    return doc.role === ACCOUNT_TYPES.SELLER ? ACCOUNT_TYPES.SELLER : ACCOUNT_TYPES.BUYER;
}

export function toPublicUser(doc) {
    return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        role: roleOf(doc),
        accountType: accountTypeOf(doc),
        status: doc.status ?? USER_STATUS.ACTIVE,
        createdAt: doc.createdAt,
    };
}

// Case-insensitive match, so "Seller@Example.com" finds "seller@example.com".
export const findUserByEmail = (email) =>
    users().findOne({ email }, { projection: PUBLIC_FIELDS, collation: CASE_INSENSITIVE });

// Includes passwordHash. Only the login route uses this.
export const findUserForLogin = (email) =>
    users().findOne(
        { email },
        { projection: { ...PUBLIC_FIELDS, passwordHash: 1 }, collation: CASE_INSENSITIVE }
    );

export const findUserById = (_id) => users().findOne({ _id }, { projection: PUBLIC_FIELDS });

export const listUsers = () =>
    users().find({}, { projection: PUBLIC_FIELDS }).sort({ createdAt: -1 }).toArray();

export const countActiveAdmins = () =>
    users().countDocuments({ role: ROLES.ADMIN, status: { $ne: USER_STATUS.SUSPENDED } });

// Registration always creates a normal user; the role is never taken from a client.
export async function createUser({ name, email, passwordHash, accountType }) {
    const doc = {
        name,
        email,
        passwordHash,
        role: ROLES.USER,
        accountType,
        status: USER_STATUS.ACTIVE,
        createdAt: new Date(),
    };
    const { insertedId } = await users().insertOne(doc);
    return toPublicUser({ ...doc, _id: insertedId });
}

// Applies already-validated changes. accountType is always written alongside,
// so a legacy record (account type stored in `role`) keeps it when its role changes.
export async function updateUser(_id, changes) {
    const current = await findUserById(_id);
    if (!current) return null;
    const set = { accountType: accountTypeOf(current), ...changes, updatedAt: new Date() };
    const doc = await users().findOneAndUpdate(
        { _id },
        { $set: set },
        { returnDocument: "after", projection: PUBLIC_FIELDS }
    );
    return doc ? toPublicUser(doc) : null;
}

export async function deleteUser(_id) {
    const { deletedCount } = await users().deleteOne({ _id });
    return deletedCount > 0;
}

// Creates the account, or promotes it (and resets its password) when the email
// already exists. Used by the create-admin script only.
export async function upsertAdmin({ name, email, passwordHash }) {
    const existing = await findUserByEmail(email);
    if (existing) {
        return updateUser(existing._id, { role: ROLES.ADMIN, status: USER_STATUS.ACTIVE, passwordHash });
    }
    const { insertedId } = await users().insertOne({
        name,
        email,
        passwordHash,
        role: ROLES.ADMIN,
        accountType: ACCOUNT_TYPES.BUYER,
        status: USER_STATUS.ACTIVE,
        createdAt: new Date(),
    });
    return toPublicUser(await findUserById(insertedId));
}

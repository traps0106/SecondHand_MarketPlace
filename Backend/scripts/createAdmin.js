// Creates the first administrator, or promotes an existing account to admin
// (and sets its password). Run on the server with direct database access:
//
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' npm run create-admin
//
// Credentials come from the environment (or Backend/.env) and are never stored
// in the repository. Nothing in the HTTP API can create an admin.
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { upsertAdmin } from "../repositories/users.js";
import { hashPassword } from "../utils/auth.js";

dotenv.config();

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = "Administrator" } = process.env;

const email = ADMIN_EMAIL?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Set ADMIN_EMAIL to a valid email address.");
    process.exit(1);
}
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12 || Buffer.byteLength(ADMIN_PASSWORD) > 72) {
    console.error("Set ADMIN_PASSWORD to 12-72 characters.");
    process.exit(1);
}

try {
    await connectDB();
    const admin = await upsertAdmin({
        name: ADMIN_NAME,
        email,
        passwordHash: await hashPassword(ADMIN_PASSWORD),
    });
    console.log(`Admin ready: ${admin.email} (id ${admin.id})`);
    process.exit(0);
} catch (error) {
    console.error("Could not create admin:", error.message);
    process.exit(1);
}

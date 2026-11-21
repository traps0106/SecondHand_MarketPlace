import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { after, before, describe, test } from "node:test";
import { promisify } from "node:util";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Integration tests against a real MongoDB, but in a throw-away database named
// "<DB_NAME>_test". The real database is never touched; the test database is
// dropped at the end.
dotenv.config({ quiet: true });
const TEST_DB = `${process.env.DB_NAME || "marketplace"}_test`;
process.env.DB_NAME = TEST_DB;
process.env.JWT_SECRET = "test-secret-test-secret-test-secret-123456";
process.env.BCRYPT_ROUNDS = "4"; // fast hashing for tests only

const { default: app } = await import("../app.js");
const { connectDB, getDB } = await import("../config/db.js");
const { hashPassword } = await import("../utils/auth.js");

const run = promisify(execFile);
const PASSWORD = "correct-horse-battery";

let server;
let base;
const state = {};

async function call(method, path, { token, body, headers } = {}) {
    const res = await fetch(base + path, {
        method,
        headers: {
            ...(body !== undefined && { "Content-Type": "application/json" }),
            ...(token && { Authorization: `Bearer ${token}` }),
            ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null, raw: text };
}

const login = async (email, password = PASSWORD) => (await call("POST", "/api/auth/login", { body: { email, password } })).body.token;

const part = (over = {}) => ({
    name: "Test headlight",
    category: "Lighting",
    condition: "Used",
    make: "Toyota",
    model: "Corolla",
    year: 2015,
    price: "12.500",
    quantity: 3,
    ...over,
});

before(async () => {
    assert.ok(TEST_DB.endsWith("_test"));
    await connectDB();
    await getDB().dropDatabase(); // start clean

    server = app.listen(0);
    base = `http://127.0.0.1:${server.address().port}`;

    // Legacy-shaped seller (account type stored in `role`, like the existing data)
    // and an admin created through the same script an operator would run.
    const { insertedId } = await getDB().collection("users").insertOne({
        name: "Legacy Seller",
        email: "legacy@example.com",
        passwordHash: await hashPassword(PASSWORD),
        role: "seller",
        status: "active",
        createdAt: new Date(),
    });
    state.legacyId = insertedId.toString();

    await run("node", ["scripts/createAdmin.js"], {
        env: {
            ...process.env,
            ADMIN_EMAIL: "admin@example.com",
            ADMIN_PASSWORD: "admin-password-123",
            ADMIN_NAME: "Admin",
        },
    });
});

after(async () => {
    await new Promise((resolve) => server.close(resolve));
    assert.ok(getDB().databaseName.endsWith("_test"));
    await getDB().dropDatabase();
    process.exit(0); // closes the shared MongoClient
});

describe("1. registration", () => {
    test("registers a user; role is forced to 'user' and no password is returned", async () => {
        const res = await call("POST", "/api/auth/register", {
            body: { name: "Alice", email: "Alice@Example.com", password: PASSWORD, accountType: "seller", role: "admin" },
        });
        assert.equal(res.status, 201);
        assert.equal(res.body.role, "user");
        assert.equal(res.body.accountType, "seller");
        assert.equal(res.body.email, "alice@example.com");
        assert.ok(!/password|hash/i.test(res.raw));
        state.alice = res.body;

        const stored = await getDB().collection("users").findOne({ email: "alice@example.com" });
        assert.match(stored.passwordHash, /^\$2[aby]\$/); // bcrypt, not plaintext
        assert.notEqual(stored.passwordHash, PASSWORD);
    });

    test("rejects duplicate email (409) and weak password (400)", async () => {
        const dup = await call("POST", "/api/auth/register", { body: { name: "A", email: "alice@example.com", password: PASSWORD } });
        assert.equal(dup.status, 409);
        const weak = await call("POST", "/api/auth/register", { body: { name: "B", email: "b@example.com", password: "short" } });
        assert.equal(weak.status, 400);
    });

    test("registers a second user (bob)", async () => {
        const res = await call("POST", "/api/auth/register", { body: { name: "Bob", email: "bob@example.com", password: PASSWORD, accountType: "seller" } });
        assert.equal(res.status, 201);
        state.bob = res.body;
    });
});

describe("2. login and JWT", () => {
    test("returns a signed, expiring JWT and the public user", async () => {
        const res = await call("POST", "/api/auth/login", { body: { email: "alice@example.com", password: PASSWORD } });
        assert.equal(res.status, 200);
        assert.equal(res.body.tokenType, "Bearer");
        assert.ok(!/password|hash/i.test(res.raw));
        const payload = jwt.decode(res.body.token);
        assert.equal(payload.sub, state.alice.id);
        assert.ok(payload.exp > payload.iat);
        assert.ok(!("role" in payload)); // role is never trusted from the token
        state.aliceToken = res.body.token;
    });

    test("wrong password and unknown email both give 401; placeholder hashes cannot log in", async () => {
        assert.equal((await call("POST", "/api/auth/login", { body: { email: "alice@example.com", password: "wrong-password" } })).status, 401);
        assert.equal((await call("POST", "/api/auth/login", { body: { email: "nobody@example.com", password: PASSWORD } })).status, 401);
        await getDB().collection("users").insertOne({ name: "M", email: "mock@example.com", passwordHash: "MOCK_HASH_001", role: "buyer", status: "active" });
        assert.equal((await call("POST", "/api/auth/login", { body: { email: "mock@example.com", password: "MOCK_HASH_001" } })).status, 401);
    });

    test("legacy user (account type in `role`) logs in as role 'user', accountType 'seller'", async () => {
        const res = await call("POST", "/api/auth/login", { body: { email: "legacy@example.com", password: PASSWORD } });
        assert.equal(res.status, 200);
        assert.equal(res.body.user.role, "user");
        assert.equal(res.body.user.accountType, "seller");
        state.legacyToken = res.body.token;
    });
});

describe("3-4. protected endpoints and 401", () => {
    test("valid JWT reaches protected endpoints", async () => {
        const me = await call("GET", "/api/auth/me", { token: state.aliceToken });
        assert.equal(me.status, 200);
        assert.equal(me.body.email, "alice@example.com");
        const list = await call("GET", "/api/seller/listings", { token: state.aliceToken });
        assert.equal(list.status, 200);
    });

    test("missing, malformed, tampered and expired tokens give 401", async () => {
        assert.equal((await call("GET", "/api/auth/me")).status, 401);
        assert.equal((await call("GET", "/api/seller/listings")).status, 401);
        assert.equal((await call("GET", "/api/admin/users")).status, 401);
        assert.equal((await call("GET", "/api/auth/me", { token: "not.a.jwt" })).status, 401);
        assert.equal((await call("GET", "/api/auth/me", { token: state.aliceToken.slice(0, -2) + "xx" })).status, 401);
        const expired = jwt.sign({}, process.env.JWT_SECRET, { subject: state.alice.id, issuer: "secondhand-marketplace", expiresIn: -10 });
        assert.equal((await call("GET", "/api/auth/me", { token: expired })).status, 401);
        const wrongSecret = jwt.sign({}, "another-secret-another-secret-123456", { subject: state.alice.id, issuer: "secondhand-marketplace" });
        assert.equal((await call("GET", "/api/auth/me", { token: wrongSecret })).status, 401);
    });

    test("the old X-User-Id header no longer authenticates", async () => {
        assert.equal((await call("GET", "/api/seller/listings", { headers: { "X-User-Id": state.alice.id } })).status, 401);
    });
});

describe("5-6. admin-only endpoints", () => {
    before(async () => {
        state.adminToken = await login("admin@example.com", "admin-password-123");
    });

    test("admin can list and manage users", async () => {
        const list = await call("GET", "/api/admin/users", { token: state.adminToken });
        assert.equal(list.status, 200);
        assert.ok(list.body.total >= 4);
        assert.ok(!/password|hash/i.test(list.raw));
        const one = await call("GET", `/api/admin/users/${state.bob.id}`, { token: state.adminToken });
        assert.equal(one.status, 200);
        const patched = await call("PATCH", `/api/admin/users/${state.bob.id}`, { token: state.adminToken, body: { name: "Bob B." } });
        assert.equal(patched.status, 200);
        assert.equal(patched.body.name, "Bob B.");
    });

    test("admin can promote a legacy seller without losing accountType", async () => {
        const res = await call("PATCH", `/api/admin/users/${state.legacyId}`, { token: state.adminToken, body: { role: "admin" } });
        assert.equal(res.status, 200);
        assert.equal(res.body.role, "admin");
        assert.equal(res.body.accountType, "seller");
        const back = await call("PATCH", `/api/admin/users/${state.legacyId}`, { token: state.adminToken, body: { role: "user" } });
        assert.equal(back.body.role, "user");
        assert.equal(back.body.accountType, "seller");
    });

    test("admin can view and moderate all listings", async () => {
        const created = await call("POST", "/api/seller/listings", { token: state.aliceToken, body: part() });
        assert.equal(created.status, 201);
        state.aliceListing = created.body.id;

        const all = await call("GET", "/api/admin/listings", { token: state.adminToken });
        assert.equal(all.status, 200);
        assert.ok(all.body.items.some((l) => l.id === state.aliceListing));

        const approve = await call("PATCH", `/api/admin/listings/${state.aliceListing}`, { token: state.adminToken, body: { status: "active" } });
        assert.equal(approve.status, 200);
        assert.equal(approve.body.status, "active");
    });

    test("normal users get 403 on every admin endpoint", async () => {
        for (const [method, path] of [
            ["GET", "/api/admin/users"],
            ["GET", `/api/admin/users/${state.bob.id}`],
            ["PATCH", `/api/admin/users/${state.bob.id}`],
            ["DELETE", `/api/admin/users/${state.bob.id}`],
            ["GET", "/api/admin/listings"],
            ["PATCH", `/api/admin/listings/${state.aliceListing}`],
            ["DELETE", `/api/admin/listings/${state.aliceListing}`],
        ]) {
            const res = await call(method, path, { token: state.aliceToken, body: method === "PATCH" ? { status: "active" } : undefined });
            assert.equal(res.status, 403, `${method} ${path}`);
        }
    });

    test("admin cannot demote or delete themselves / the last admin", async () => {
        const adminId = (await call("GET", "/api/auth/me", { token: state.adminToken })).body.id;
        assert.equal((await call("PATCH", `/api/admin/users/${adminId}`, { token: state.adminToken, body: { role: "user" } })).status, 400);
        assert.equal((await call("DELETE", `/api/admin/users/${adminId}`, { token: state.adminToken })).status, 400);
    });
});

describe("7. listing ownership", () => {
    before(async () => {
        state.bobToken = await login("bob@example.com");
    });

    test("another user cannot update or delete Alice's listing (403) and it is unchanged", async () => {
        const patch = await call("PATCH", `/api/seller/listings/${state.aliceListing}`, { token: state.bobToken, body: { price: "1.000" } });
        assert.equal(patch.status, 403);
        const del = await call("DELETE", `/api/seller/listings/${state.aliceListing}`, { token: state.bobToken });
        assert.equal(del.status, 403);

        const mine = await call("GET", `/api/seller/listings/${state.aliceListing}`, { token: state.aliceToken });
        assert.equal(mine.status, 200);
        assert.equal(mine.body.price, 12.5);
    });

    test("owner can update and delete their own listing; unknown id is 404", async () => {
        const patch = await call("PATCH", `/api/seller/listings/${state.aliceListing}`, { token: state.aliceToken, body: { quantity: 9 } });
        assert.equal(patch.status, 200);
        assert.equal(patch.body.quantity, 9);

        const missing = await call("DELETE", "/api/seller/listings/aaaaaaaaaaaaaaaaaaaaaaaa", { token: state.aliceToken });
        assert.equal(missing.status, 404);

        const del = await call("DELETE", `/api/seller/listings/${state.aliceListing}`, { token: state.aliceToken });
        assert.equal(del.status, 204);
    });
});

describe("8. no self-promotion", () => {
    test("a user cannot become admin via register, profile update, admin endpoint or a forged token", async () => {
        // role in the registration body is ignored (covered in test 1); profile update ignores it too
        const me = await call("PATCH", "/api/auth/me", { token: state.aliceToken, body: { name: "Alice A.", role: "admin", accountType: "buyer", status: "active" } });
        assert.equal(me.status, 200);
        assert.equal(me.body.role, "user");
        assert.equal(me.body.accountType, "seller");

        const self = await call("PATCH", `/api/admin/users/${state.alice.id}`, { token: state.aliceToken, body: { role: "admin" } });
        assert.equal(self.status, 403);

        const forged = jwt.sign({ role: "admin", sub: state.alice.id }, process.env.JWT_SECRET, { issuer: "secondhand-marketplace" });
        assert.equal((await call("GET", "/api/admin/users", { token: forged })).status, 403);

        const stored = await getDB().collection("users").findOne({ email: "alice@example.com" });
        assert.equal(stored.role, "user");
    });

    test("suspending a user locks them out immediately", async () => {
        await call("PATCH", `/api/admin/users/${state.bob.id}`, { token: state.adminToken, body: { status: "suspended" } });
        assert.equal((await call("GET", "/api/auth/me", { token: state.bobToken })).status, 403);
        assert.equal((await call("POST", "/api/auth/login", { body: { email: "bob@example.com", password: PASSWORD } })).status, 403);
    });
});

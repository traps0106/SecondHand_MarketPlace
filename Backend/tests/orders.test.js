import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import dotenv from "dotenv";
import { ObjectId, Decimal128 } from "mongodb";

// Integration tests against a real MongoDB Atlas replica set, in a throw-away
// "<DB_NAME>_test" database (created on first write, dropped at the end).
// The real database is never touched.
dotenv.config({ quiet: true });
const TEST_DB = `${process.env.DB_NAME || "marketplace"}_test`;
process.env.DB_NAME = TEST_DB;
process.env.JWT_SECRET = "test-secret-test-secret-test-secret-123456";
process.env.BCRYPT_ROUNDS = "4";

const { default: app } = await import("../app.js");
const { connectDB, getClient, getDB } = await import("../config/db.js");
const { hashPassword } = await import("../utils/auth.js");

const PASSWORD = "correct-horse-battery";
let server;
let base;
const buyers = [];
let sellerId;

const listings = () => getDB().collection("listings");
const orders = () => getDB().collection("orders");

async function call(method, path, { token, body } = {}) {
    const res = await fetch(base + path, {
        method,
        headers: {
            ...(body !== undefined && { "Content-Type": "application/json" }),
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
}

async function addListing(quantity, over = {}) {
    const { insertedId } = await listings().insertOne({
        sellerId,
        title: "Test brake caliper",
        category: "Brakes & suspension",
        condition: "Used",
        vehicleMake: "Toyota",
        vehicleModel: "Camry",
        vehicleYear: 2015,
        price: Decimal128.fromString("24.500"),
        quantity,
        status: "active",
        createdAt: new Date(),
        ...over,
    });
    return insertedId;
}

const buy = (buyer, listingId, quantity = 1) =>
    call("POST", "/api/orders", { token: buyer.token, body: { items: [{ listingId: listingId.toString(), quantity }] } });

const stockOf = async (id) => (await listings().findOne({ _id: id })).quantity;

before(async () => {
    assert.ok(TEST_DB.endsWith("_test"));
    await connectDB();
    await getDB().dropDatabase();

    server = app.listen(0);
    base = `http://127.0.0.1:${server.address().port}`;

    const hash = await hashPassword(PASSWORD);
    const users = getDB().collection("users");
    sellerId = (await users.insertOne({ name: "Seller", email: "seller@example.com", passwordHash: hash, role: "user", accountType: "seller", status: "active" })).insertedId;
    for (let i = 1; i <= 10; i++) {
        const email = `buyer${i}@example.com`;
        const { insertedId } = await users.insertOne({ name: `Buyer ${i}`, email, passwordHash: hash, role: "user", accountType: "buyer", status: "active" });
        const login = await call("POST", "/api/auth/login", { body: { email, password: PASSWORD } });
        buyers.push({ id: insertedId, token: login.body.token });
    }
    const sellerLogin = await call("POST", "/api/auth/login", { body: { email: "seller@example.com", password: PASSWORD } });
    buyers.seller = { id: sellerId, token: sellerLogin.body.token };
});

after(async () => {
    await new Promise((resolve) => server.close(resolve));
    assert.ok(getDB().databaseName.endsWith("_test"));
    await getDB().dropDatabase();
    process.exit(0);
});

describe("deployment", () => {
    test("the cluster is a replica set, so multi-document transactions are available", async () => {
        const hello = await getDB().command({ hello: 1 });
        assert.ok(hello.setName, "not a replica set; transactions need one");
        assert.ok(hello.maxWireVersion >= 7);
        console.log(`    replica set ${hello.setName}, ${hello.hosts.length} members`);
    });
});

describe("1. successful purchase", () => {
    test("reduces stock and creates one order in the existing orders shape", async () => {
        const id = await addListing(5);
        const res = await buy(buyers[0], id, 2);
        assert.equal(res.status, 201);
        assert.equal(res.body.buyerId, buyers[0].id.toString());
        assert.equal(res.body.totalAmount, 49);
        assert.equal(res.body.items[0].quantity, 2);
        assert.equal(await stockOf(id), 3);

        const stored = await orders().find({ "items.listingId": id }).toArray();
        assert.equal(stored.length, 1);
        assert.ok(stored[0].buyerId instanceof ObjectId);
        assert.ok(stored[0].totalAmount instanceof Decimal128);
        assert.equal(stored[0].totalAmount.toString(), "49.000");

        const mine = await call("GET", "/api/orders", { token: buyers[0].token });
        assert.equal(mine.status, 200);
        assert.equal(mine.body.total, 1);
    });

    test("requires sign-in and validates input; a client-supplied buyer or price is ignored", async () => {
        const id = await addListing(2);
        assert.equal((await call("POST", "/api/orders", { body: { items: [{ listingId: id.toString() }] } })).status, 401);
        assert.equal((await call("POST", "/api/orders", { token: buyers[0].token, body: { items: [] } })).status, 400);
        assert.equal((await call("POST", "/api/orders", { token: buyers[0].token, body: { items: [{ listingId: "nope" }] } })).status, 400);

        const res = await call("POST", "/api/orders", {
            token: buyers[1].token,
            body: { buyerId: buyers[2].id.toString(), items: [{ listingId: id.toString(), quantity: 1, unitPrice: "0.001" }] },
        });
        assert.equal(res.status, 201);
        assert.equal(res.body.buyerId, buyers[1].id.toString());
        assert.equal(res.body.totalAmount, 24.5);
    });

    test("rejects more than the available stock, an own listing and an inactive listing without changing anything", async () => {
        const id = await addListing(2);
        const tooMany = await buy(buyers[0], id, 3);
        assert.equal(tooMany.status, 409);
        assert.equal(await stockOf(id), 2);

        const own = await buy(buyers.seller, id, 1);
        assert.equal(own.status, 403);
        assert.equal(await stockOf(id), 2, "own-listing rejection must roll the decrement back");

        const inactive = await addListing(5, { status: "pending" });
        assert.equal((await buy(buyers[0], inactive)).status, 404);
        assert.equal(await stockOf(inactive), 5);
        assert.equal(await orders().countDocuments({ "items.listingId": { $in: [id, inactive] } }), 0);
    });
});

describe("2-6. two buyers, one remaining unit", () => {
    test("exactly one succeeds, the other is rejected, stock ends at 0, one order exists", async () => {
        const id = await addListing(1);
        const [a, b] = await Promise.all([buy(buyers[0], id), buy(buyers[1], id)]);

        const statuses = [a.status, b.status].sort();
        assert.deepEqual(statuses, [201, 409], `got ${a.status} and ${b.status}`);
        const loser = a.status === 409 ? a : b;
        assert.match(loser.body.error, /no longer available|left/);

        assert.equal(await stockOf(id), 0);
        assert.equal(await orders().countDocuments({ "items.listingId": id }), 1);
        console.log(`    buyer1 -> ${a.status}, buyer2 -> ${b.status}; stock 0; 1 order`);
    });

    test("10 simultaneous buyers for the last unit: one 201, nine 409, stock 0, one order", async () => {
        const id = await addListing(1);
        const results = await Promise.all(buyers.slice(0, 10).map((buyer) => buy(buyer, id)));

        assert.equal(results.filter((r) => r.status === 201).length, 1);
        assert.equal(results.filter((r) => r.status === 409).length, 9);
        assert.equal(await stockOf(id), 0);
        assert.equal(await orders().countDocuments({ "items.listingId": id }), 1);
    });

    test("10 buyers, 3 units: exactly 3 succeed and stock never goes negative", async () => {
        const id = await addListing(3);
        const results = await Promise.all(buyers.slice(0, 10).map((buyer) => buy(buyer, id)));

        assert.equal(results.filter((r) => r.status === 201).length, 3);
        assert.equal(results.filter((r) => r.status === 409).length, 7);
        assert.equal(await stockOf(id), 0);
        assert.equal(await orders().countDocuments({ "items.listingId": id }), 3);
    });
});

describe("7. rollback", () => {
    test("a multi-line order is all or nothing (second line fails, first line's stock is restored)", async () => {
        const first = await addListing(4);
        const second = await addListing(1);
        const res = await call("POST", "/api/orders", {
            token: buyers[0].token,
            body: { items: [{ listingId: first.toString(), quantity: 2 }, { listingId: second.toString(), quantity: 5 }] },
        });
        assert.equal(res.status, 409);
        assert.equal(await stockOf(first), 4);
        assert.equal(await stockOf(second), 1);
        assert.equal(await orders().countDocuments({ "items.listingId": { $in: [first, second] } }), 0);
    });

    test("when order creation fails, the stock decrement is rolled back", async () => {
        const id = await addListing(3);

        // Make every insert into `orders` fail with a real database error.
        const db = getDB();
        await db.command({ collMod: "orders", validator: { $jsonSchema: { required: ["__field_nobody_sets__"] } }, validationLevel: "strict", validationAction: "error" });

        // The app logs this expected 500 with console.error; capture it for this
        // test only (restored in `finally`) instead of printing the stack trace.
        const originalConsoleError = console.error;
        const logged = [];
        console.error = (...args) => logged.push(args);

        try {
            const before = await orders().countDocuments();
            const res = await buy(buyers[0], id, 2);
            assert.equal(res.status, 500);
            assert.equal(logged.length, 1, "exactly one error should have been logged");
            assert.equal(logged[0][0]?.code, 121, "the logged error must be the expected validation failure");
            assert.equal(await stockOf(id), 3, "stock must be unchanged after the failed order insert");
            assert.equal(await orders().countDocuments(), before);
        } finally {
            console.error = originalConsoleError;
            await db.command({ collMod: "orders", validator: {}, validationLevel: "off" });
        }

        // ...and once the failure is gone the same purchase works.
        assert.equal((await buy(buyers[0], id, 2)).status, 201);
        assert.equal(await stockOf(id), 1);
    });
});

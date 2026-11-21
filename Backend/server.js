import dotenv from "dotenv";
import app from "./app.js";
import { connectDB, getDB } from "./config/db.js";
import { getJwtSecret } from "./config/auth.js";
import { ensureSellerListingIndexes } from "./repositories/sellerListings.js";

dotenv.config();

const PORT = process.env.PORT || 5000;


async function startServer() {
    try {
        getJwtSecret(); // fail fast when JWT_SECRET is missing or too short
        await connectDB();

        await getDB().collection("carts").createIndex({ userId: 1 }, { unique: true });
        await ensureSellerListingIndexes();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();

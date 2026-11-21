import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, getDB } from "./config/db.js";
import cartRoutes from "./routes/cart.js";
import metaRoutes from "./routes/meta.js";
import partRoutes from "./routes/parts.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/meta", metaRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/parts", partRoutes);

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Express 5 forwards rejected async handlers here.
app.use((err, req, res, next) => {
    // Malformed JSON bodies are a client error, not a server fault.
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Request body is not valid JSON" });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();

        await getDB().collection("carts").createIndex({ userId: 1 }, { unique: true });

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();

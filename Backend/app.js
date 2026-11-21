import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import metaRoutes from "./routes/meta.js";
import partRoutes from "./routes/parts.js";
import sellerListingRoutes from "./routes/sellerListings.js";
import sessionRoutes from "./routes/session.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/meta", metaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/parts", partRoutes);
app.use("/api/seller/listings", sellerListingRoutes);

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

export default app;

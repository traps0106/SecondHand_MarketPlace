
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, getDB } from "./config/db.js";
import cartRoutes from "./routes/cart.js";
import partRoutes from "./routes/parts.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("The backend works W");
});

app.use("/api/cart", cartRoutes);
app.use("/api/parts", partRoutes);

// Express 5 forwards rejected async handlers here.
app.use((err, req, res, next) => {
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

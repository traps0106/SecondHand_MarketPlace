import { Router } from "express";
import { findActiveParts, findPartById } from "../utils/listings.js";

// Public catalogue, backed by the `listings` collection.
const router = Router();

router.get("/", async (req, res) => {
    res.json(await findActiveParts());
});

router.get("/:id", async (req, res) => {
    const part = await findPartById(req.params.id);
    if (!part) return res.status(404).json({ error: "Part not found" });
    res.json(part);
});

export default router;

import { Router } from "express";
import {
    CURRENCY,
    LISTING_CATEGORIES,
    LISTING_CONDITIONS,
    LISTING_LIMITS,
    LISTING_STATUS_LABELS,
} from "../config/referenceData.js";

// Read-only reference data the UI uses to build forms and filters.
const router = Router();

router.get("/", (req, res) => {
    res.set("Cache-Control", "public, max-age=300");
    res.json({
        categories: LISTING_CATEGORIES,
        conditions: LISTING_CONDITIONS,
        statuses: Object.entries(LISTING_STATUS_LABELS).map(([value, label]) => ({ value, label })),
        currency: CURRENCY,
        limits: { ...LISTING_LIMITS, maxYear: new Date().getFullYear() + 1 },
    });
});

export default router;

import { Router } from "express";
import { requireUser } from "../middleware/currentUser.js";

// Kept for existing clients: GET /api/session returns the signed-in account.
// Sign-in itself is POST /api/auth/login (see routes/auth.js); the old
// email-only POST /api/session was removed because it skipped the password.
const router = Router();

router.get("/", requireUser, (req, res) => {
    const { _id, ...user } = req.user;
    res.json(user);
});

export default router;

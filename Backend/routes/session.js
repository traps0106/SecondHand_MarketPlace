import { Router } from "express";
import { requireUser } from "../middleware/currentUser.js";
import { findUserByEmail, toPublicUser } from "../repositories/users.js";

// TEMPORARY sign-in: resolves an email to an existing account so the client
// can identify itself. Passwords are not checked yet; this is replaced by a
// proper POST /api/auth/login (bcrypt + JWT) in the authentication milestone.
const router = Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/", async (req, res) => {
    const email = req.body?.email;
    if (typeof email !== "string" || email.length > 254 || !EMAIL_PATTERN.test(email.trim())) {
        return res.status(400).json({ error: "Enter a valid email address" });
    }

    const user = await findUserByEmail(email.trim());
    if (!user) return res.status(404).json({ error: "No account found for that email" });

    res.json(toPublicUser(user));
});

// Returns the account the current identity belongs to.
router.get("/", requireUser, (req, res) => {
    const { _id, ...user } = req.user;
    res.json(user);
});

export default router;

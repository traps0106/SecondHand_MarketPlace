import { Router } from "express";
import { ACCOUNT_TYPES, USER_STATUS, getJwtExpiresIn } from "../config/auth.js";
import { requireUser } from "../middleware/currentUser.js";
import {
    createUser,
    findUserByEmail,
    findUserForLogin,
    toPublicUser,
    updateUser,
} from "../repositories/users.js";
import { hashPassword, signToken, validatePassword, verifyPassword } from "../utils/auth.js";

// /api/auth: registration, login (JWT) and the caller's own profile.
const router = Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 100;

// Only these fields are ever read from a body. "role", "status", "id" and the
// like are ignored, so a client cannot grant itself anything.
function validateName(raw) {
    if (typeof raw !== "string" || !raw.trim()) return { error: "Name is required" };
    if (raw.trim().length > NAME_MAX) return { error: `Name must be at most ${NAME_MAX} characters` };
    return { value: raw.trim() };
}

function validateEmail(raw) {
    const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
    if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address" };
    return { value: email };
}

// POST /api/auth/register  { name, email, password, accountType? }
// Always creates a normal user (role "user"); accountType is "buyer" or "seller".
router.post("/register", async (req, res) => {
    const body = req.body ?? {};
    const errors = {};

    const name = validateName(body.name);
    if (name.error) errors.name = name.error;

    const email = validateEmail(body.email);
    if (email.error) errors.email = email.error;

    const passwordError = validatePassword(body.password);
    if (passwordError) errors.password = passwordError;

    const accountType = body.accountType ?? ACCOUNT_TYPES.BUYER;
    if (!Object.values(ACCOUNT_TYPES).includes(accountType)) {
        errors.accountType = `Must be one of: ${Object.values(ACCOUNT_TYPES).join(", ")}`;
    }

    if (Object.keys(errors).length) {
        return res.status(400).json({ error: "Some fields are invalid", details: errors });
    }

    if (await findUserByEmail(email.value)) {
        return res.status(409).json({ error: "An account with that email already exists" });
    }

    try {
        const user = await createUser({
            name: name.value,
            email: email.value,
            passwordHash: await hashPassword(body.password),
            accountType,
        });
        res.status(201).json(user);
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ error: "An account with that email already exists" });
        }
        throw error;
    }
});

// POST /api/auth/login  { email, password } -> { token, tokenType, expiresIn, user }
// Wrong email and wrong password give the same answer.
router.post("/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await findUserForLogin(email.trim());
    const passwordOk = await verifyPassword(password, user?.passwordHash);
    if (!user || !passwordOk) return res.status(401).json({ error: "Incorrect email or password" });

    const publicUser = toPublicUser(user);
    if (publicUser.status === USER_STATUS.SUSPENDED) {
        return res.status(403).json({ error: "This account is suspended" });
    }

    res.json({
        token: signToken(user._id),
        tokenType: "Bearer",
        expiresIn: getJwtExpiresIn(),
        user: publicUser,
    });
});

// GET /api/auth/me
router.get("/me", requireUser, (req, res) => {
    const { _id, ...user } = req.user;
    res.json(user);
});

// PATCH /api/auth/me  { name }  — the only self-editable field. Role, status and
// account type cannot be changed here (or by anyone but an admin).
router.patch("/me", requireUser, async (req, res) => {
    const name = validateName(req.body?.name);
    if (name.error) return res.status(400).json({ error: "Some fields are invalid", details: { name: name.error } });
    res.json(await updateUser(req.user._id, { name: name.value }));
});

export default router;

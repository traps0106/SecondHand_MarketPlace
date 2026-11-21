import { LISTING_CATEGORIES, LISTING_CONDITIONS, LISTING_LIMITS } from "../config/referenceData.js";

// Validates and normalises a listing payload from a client.
//
// - Only whitelisted fields are read; anything else in the body is ignored.
// - Every value must be a primitive of the expected type, so objects such as
//   {"$gt": ""} can never reach a MongoDB query or update (NoSQL injection).
// - With { partial: true } only the fields present are checked (for PATCH).
//
// Returns { value, errors }. `errors` maps field name -> message and is
// empty when the payload is valid.

const PRICE_PATTERN = /^\d+(\.\d{1,3})?$/;

const text = (max, { required = true } = {}) => (raw) => {
    if (raw === undefined || raw === null || raw === "") {
        return required ? { error: "This field is required" } : { value: "" };
    }
    if (typeof raw !== "string") return { error: "Must be text" };
    const value = raw.trim();
    if (required && !value) return { error: "This field is required" };
    if (value.length > max) return { error: `Must be at most ${max} characters` };
    return { value };
};

const oneOf = (allowed) => (raw) =>
    allowed.includes(raw) ? { value: raw } : { error: `Must be one of: ${allowed.join(", ")}` };

const integer = (min, max) => (raw) => {
    const n = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;
    if (!Number.isInteger(n)) return { error: "Must be a whole number" };
    if (n < min || n > max) return { error: `Must be between ${min} and ${max}` };
    return { value: n };
};

// Prices are handled as strings so 3-decimal BHD amounts stay exact.
const price = (raw) => {
    const str = typeof raw === "number" ? String(raw) : raw;
    if (typeof str !== "string" || !PRICE_PATTERN.test(str.trim())) {
        return { error: "Enter a price with up to 3 decimal places" };
    }
    const n = Number(str);
    if (n <= 0 || n > LISTING_LIMITS.maxPrice) {
        return { error: `Must be more than 0 and at most ${LISTING_LIMITS.maxPrice}` };
    }
    return { value: n.toFixed(3) };
};

const RULES = {
    name: text(LISTING_LIMITS.nameMaxLength),
    category: oneOf(LISTING_CATEGORIES),
    condition: oneOf(LISTING_CONDITIONS),
    make: text(LISTING_LIMITS.vehicleFieldMaxLength),
    model: text(LISTING_LIMITS.vehicleFieldMaxLength),
    year: (raw) => integer(LISTING_LIMITS.minYear, new Date().getFullYear() + 1)(raw),
    price,
    quantity: integer(0, LISTING_LIMITS.maxQuantity),
    description: text(LISTING_LIMITS.descriptionMaxLength, { required: false }),
    partNumber: text(LISTING_LIMITS.partNumberMaxLength, { required: false }),
};

export const LISTING_FIELDS = Object.freeze(Object.keys(RULES));

export function validateListing(body, { partial = false, fields = LISTING_FIELDS } = {}) {
    const input = body && typeof body === "object" && !Array.isArray(body) ? body : {};
    const value = {};
    const errors = {};

    for (const field of fields) {
        if (partial && !(field in input)) continue;
        const result = RULES[field](input[field]);
        if (result.error) errors[field] = result.error;
        else value[field] = result.value;
    }

    if (partial && Object.keys(value).length === 0 && Object.keys(errors).length === 0) {
        errors._ = "No fields to update";
    }

    return { value, errors };
}

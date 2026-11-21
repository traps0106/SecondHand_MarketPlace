// Reference values shared by validation and the UI.
// Exposed through GET /api/meta so clients never hardcode them. If these move
// into their own collection later, only this module needs to change.

export const LISTING_CATEGORIES = Object.freeze([
    'Electrical & ignition',
    'Lighting',
    'Body panels & bumpers',
    'Mirrors & glass',
    'Brakes & suspension',
    'Engine & cooling',
]);

export const LISTING_CONDITIONS = Object.freeze(['Used', 'Refurbished']);

export const LISTING_STATUS = Object.freeze({
    PENDING: 'pending',
    ACTIVE: 'active',
    REJECTED: 'rejected',
    INACTIVE: 'inactive',
});

// Human-readable labels, keyed by stored status value.
export const LISTING_STATUS_LABELS = Object.freeze({
    [LISTING_STATUS.PENDING]: 'In review',
    [LISTING_STATUS.ACTIVE]: 'Active',
    [LISTING_STATUS.REJECTED]: 'Rejected',
    [LISTING_STATUS.INACTIVE]: 'Inactive',
});

export const CURRENCY = Object.freeze({ code: 'BHD', decimals: 3 });

export const LISTING_LIMITS = Object.freeze({
    nameMaxLength: 120,
    vehicleFieldMaxLength: 50,
    descriptionMaxLength: 2000,
    partNumberMaxLength: 50,
    minYear: 1950,
    maxPrice: 100000,
    maxQuantity: 9999,
});

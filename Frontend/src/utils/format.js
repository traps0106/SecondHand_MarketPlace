// Display formatting shared across pages.

// BHD uses 3 decimal places (fils).
export const formatAmount = (n) => Number(n).toFixed(3);
export const formatBHD = (n) => `BHD ${formatAmount(n)}`;

export const yearRange = (p) => (p.yearFrom === p.yearTo ? `${p.yearFrom}` : `${p.yearFrom}–${p.yearTo}`);

export const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

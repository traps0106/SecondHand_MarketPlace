import { apiRequest } from './client';

let cached;

// Reference data (categories, conditions, statuses, limits) from the API.
// Fetched once per page load and shared by every caller.
export function getMeta() {
    if (!cached) {
        cached = apiRequest('/api/meta').catch((err) => {
            cached = undefined; // allow a retry after a failure
            throw err;
        });
    }
    return cached;
}

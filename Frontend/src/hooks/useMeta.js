import { useEffect, useState } from 'react';
import { getMeta } from '../api/meta';

// Loads API reference data. `meta` stays null until it arrives.
export default function useMeta() {
    const [meta, setMeta] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        getMeta()
            .then((m) => { if (!cancelled) setMeta(m); })
            .catch((e) => { if (!cancelled) setError(e.message); });
        return () => { cancelled = true; };
    }, []);

    const statusLabel = (value) => meta?.statuses.find((s) => s.value === value)?.label ?? value;

    return { meta, error, statusLabel };
}

import { useEffect, useState } from 'react';
import { listMyListings, updateListingQuantity } from '../../api/seller';
import useMeta from '../../hooks/useMeta';

const isValidQuantity = (value, max) => /^\d+$/.test(value.trim()) && Number(value) <= max;

export default function Inventory() {
    const { meta, statusLabel } = useMeta();
    const [rows, setRows] = useState(null); // [{ listing, draft }]
    const [loadError, setLoadError] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        listMyListings()
            .then(({ items }) => {
                if (!cancelled) setRows(items.map((listing) => ({ listing, draft: String(listing.quantity) })));
            })
            .catch((e) => { if (!cancelled) setLoadError(e.message); });
        return () => { cancelled = true; };
    }, []);

    const availability = ({ status, quantity }) => {
        if (status !== 'active') return `Hidden · ${statusLabel(status)}`;
        return quantity > 0 ? 'Available' : 'Out of stock';
    };

    const setDraft = (id, draft) =>
        setRows((list) => list.map((r) => (r.listing.id === id ? { ...r, draft } : r)));

    const handleSave = async () => {
        const maxQuantity = meta?.limits.maxQuantity ?? Infinity;
        if (rows.some((r) => !isValidQuantity(r.draft, maxQuantity))) {
            setFeedback({ type: 'error', text: 'Enter a whole number of 0 or more. Changes were not saved.' });
            return;
        }

        const changed = rows.filter((r) => Number(r.draft) !== r.listing.quantity);
        if (!changed.length) {
            setFeedback({ type: 'success', text: 'No stock changes were made.' });
            return;
        }

        // Save rows independently so one failure does not block the others.
        setSaving(true);
        const results = await Promise.allSettled(
            changed.map((r) => updateListingQuantity(r.listing.id, Number(r.draft))),
        );
        setSaving(false);

        const saved = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
        const failed = results.length - saved.length;
        const byId = new Map(saved.map((l) => [l.id, l]));

        setRows((list) => list.map((r) => {
            const updated = byId.get(r.listing.id);
            return updated ? { listing: updated, draft: String(updated.quantity) } : r;
        }));

        const summary = saved.map((l) => `${l.name}: ${l.quantity} units`).join(', ');
        setFeedback(failed
            ? { type: 'error', text: `${failed} change${failed > 1 ? 's' : ''} could not be saved.${summary ? ` Saved: ${summary}.` : ''}` }
            : { type: 'success', text: `Stock saved successfully. ${summary}.` });
    };

    const handleCancel = () => {
        setRows((list) => list.map((r) => ({ ...r, draft: String(r.listing.quantity) })));
        setFeedback(null);
    };

    return (
        <div className="card">
            <h2 className="card-title">Inventory</h2>
            <p className="card-subtitle">
                Manage stock quantities for your own listings. Enter whole numbers, zero or above.
                Stock changes do not need re-approval.
            </p>

            {feedback && (
                <div className={`inventory-feedback ${feedback.type}`} role="status" aria-live="polite">
                    {feedback.text}
                </div>
            )}

            {loadError ? (
                <div className="banner banner-error" role="alert">⚠ {loadError}. Make sure the backend is running.</div>
            ) : !rows ? (
                <p>Loading inventory…</p>
            ) : rows.length === 0 ? (
                <p>You have no listings yet.</p>
            ) : (
                <>
                    <table className="data-table inventory-table">
                        <thead>
                            <tr>
                                <th scope="col">Part/vehicle</th>
                                <th scope="col">Saved stock</th>
                                <th scope="col">New stock</th>
                                <th scope="col">Availability</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(({ listing, draft }) => (
                                <tr key={listing.id}>
                                    <td>
                                        <strong>{listing.name}</strong>
                                        <div className="inventory-meta">
                                            {listing.make} {listing.model} · {listing.year}
                                        </div>
                                    </td>
                                    <td>{listing.quantity}</td>
                                    <td>
                                        <label className="sr-only" htmlFor={`stock-${listing.id}`}>
                                            New stock quantity for {listing.name}
                                        </label>
                                        <input
                                            id={`stock-${listing.id}`}
                                            type="number"
                                            min="0"
                                            max={meta?.limits.maxQuantity}
                                            step="1"
                                            className="form-input stock-input"
                                            value={draft}
                                            onChange={(e) => setDraft(listing.id, e.target.value)}
                                        />
                                    </td>
                                    <td>{availability(listing)}</td>
                                    <td><span className="status-badge">{statusLabel(listing.status)}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="inventory-actions">
                        <button onClick={handleSave} className="btn-primary" type="button" disabled={saving}>
                            {saving ? 'Saving…' : 'Save changes'}
                        </button>
                        <button onClick={handleCancel} className="btn-secondary" type="button" disabled={saving}>
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

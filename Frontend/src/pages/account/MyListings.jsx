import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { deleteListing, listMyListings } from '../../api/seller';
import useMeta from '../../hooks/useMeta';
import { formatAmount } from '../../utils/format';

const NOTICES = {
    created: 'Listing submitted for review. It will appear in Browse once an administrator approves it.',
    updated: 'Changes saved. Edited listings are re-reviewed before they appear in Browse again.',
};

export default function MyListings() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { meta, statusLabel } = useMeta();

    const [filters, setFilters] = useState({ search: '', status: '' });
    const [search, setSearch] = useState('');
    const [listings, setListings] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [pendingDelete, setPendingDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [notice, setNotice] = useState(NOTICES[state?.result] ?? '');
    const [actionError, setActionError] = useState('');

    // Reload whenever the applied filters change; ignore responses that
    // arrive after a newer request has started.
    useEffect(() => {
        let cancelled = false;
        listMyListings(filters)
            .then(({ items }) => {
                if (cancelled) return;
                setListings(items);
                setLoadError('');
            })
            .catch((e) => { if (!cancelled) setLoadError(e.message); });
        return () => { cancelled = true; };
    }, [filters]);

    const applySearch = (e) => {
        e.preventDefault();
        setFilters((f) => ({ ...f, search }));
    };

    const confirmDelete = async () => {
        setDeleting(true);
        setActionError('');
        try {
            await deleteListing(pendingDelete.id);
            setListings((list) => list.filter((l) => l.id !== pendingDelete.id));
            setNotice(`"${pendingDelete.name}" was deleted.`);
            setPendingDelete(null);
        } catch (e) {
            setActionError(e.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <div className="page-heading listings-heading">
                <div>
                    <h2>My listings</h2>
                    <p>Create and manage your secondhand car part listings.</p>
                </div>

                <button className="btn-primary" type="button" onClick={() => navigate('/account/listings/new')}>
                    Create listing
                </button>
            </div>

            {notice && <div className="banner banner-success" role="status">✓ {notice}</div>}
            {actionError && <div className="banner banner-error" role="alert">⚠ {actionError}</div>}

            <form className="filter-toolbar" onSubmit={applySearch}>
                <div className="filter-search">
                    <label htmlFor="listing-search">Search my listings</label>
                    <input
                        id="listing-search"
                        type="search"
                        placeholder="Part name, vehicle or part number"
                        className="form-input"
                        maxLength={meta?.limits.nameMaxLength}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="filter-status">
                    <label htmlFor="listing-status">Moderation status</label>
                    <select
                        id="listing-status"
                        className="form-input"
                        value={filters.status}
                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                    >
                        <option value="">All statuses</option>
                        {meta?.statuses.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>

                <button className="btn-secondary" type="submit">Apply filters</button>
            </form>

            <div className="card">
                <h3 className="card-title">My listing list</h3>

                {loadError ? (
                    <div className="banner banner-error" role="alert">
                        ⚠ {loadError}. Make sure the backend is running.
                    </div>
                ) : !listings ? (
                    <p>Loading listings…</p>
                ) : (
                    <>
                        <p className="card-subtitle">
                            {listings.length} {listings.length === 1 ? 'listing' : 'listings'} · Only your listings are shown · Prices in BHD
                        </p>

                        {listings.length === 0 ? (
                            <p>No listings match. Create one to start selling.</p>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Part / vehicle</th>
                                        <th scope="col">Price (BHD)</th>
                                        <th scope="col">Stock</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listings.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <strong>{item.name}</strong>
                                                <div className="listing-meta">
                                                    {item.make} {item.model} · {item.year}
                                                    {item.partNumber && ` · ${item.partNumber}`}
                                                </div>
                                            </td>
                                            <td>{formatAmount(item.price)}</td>
                                            <td>{item.quantity}</td>
                                            <td>
                                                <span className="status-badge">{statusLabel(item.status)}</span>
                                            </td>
                                            <td>
                                                <button
                                                    className="listing-action"
                                                    type="button"
                                                    onClick={() => navigate(`/account/listings/${item.id}/edit`)}
                                                    aria-label={`Edit ${item.name}`}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="listing-delete"
                                                    type="button"
                                                    onClick={() => { setPendingDelete(item); setActionError(''); }}
                                                    aria-label={`Delete ${item.name}`}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>

            {pendingDelete && (
                <div className="card" role="alertdialog" aria-labelledby="delete-title" aria-describedby="delete-description">
                    <h4 className="delete-title" id="delete-title">Delete listing?</h4>
                    <p className="delete-listing-name">
                        {pendingDelete.name} · {pendingDelete.make} {pendingDelete.model} · {pendingDelete.year}
                    </p>
                    <p className="delete-description" id="delete-description">
                        This removes the listing from your account, the marketplace and any buyer carts.
                        This cannot be undone.
                    </p>
                    <div className="delete-actions">
                        <button className="btn-primary" type="button" onClick={confirmDelete} disabled={deleting}>
                            {deleting ? 'Deleting…' : 'Confirm delete'}
                        </button>
                        <button className="btn-secondary" type="button" onClick={() => setPendingDelete(null)} disabled={deleting}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

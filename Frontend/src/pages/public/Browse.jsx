import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, PARTS, formatBHD, yearRange } from '../../data/parts';

const DEFAULT_FILTERS = {
    query: '',
    sort: 'newest',
    categories: [],
    make: '',
    year: '',
    conditions: ['Used'],
    inStock: true,
    min: '',
    max: '40',
};

const EMPTY_FILTERS = {
    ...DEFAULT_FILTERS,
    categories: [],
    conditions: [],
    inStock: false,
    max: '',
};

const MAKES = [...new Set(PARTS.map((p) => p.make))].sort();
const YEARS = Array.from({ length: 2026 - 2010 + 1 }, (_, i) => String(2026 - i));

const toggle = (list, value) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

function applyFilters(parts, f) {
    const q = f.query.trim().toLowerCase();
    const min = f.min === '' ? null : Number(f.min);
    const max = f.max === '' ? null : Number(f.max);

    const result = parts.filter((p) => {
        if (q && !`${p.name} ${p.make} ${p.model} ${p.id}`.toLowerCase().includes(q)) return false;
        if (f.categories.length && !f.categories.includes(p.category)) return false;
        if (f.make && p.make !== f.make) return false;
        if (f.year && !(p.yearFrom <= Number(f.year) && Number(f.year) <= p.yearTo)) return false;
        if (f.conditions.length && !f.conditions.includes(p.condition)) return false;
        if (f.inStock && p.stock < 1) return false;
        if (min !== null && p.price < min) return false;
        if (max !== null && p.price > max) return false;
        return true;
    });

    if (f.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (f.sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    return result;
}

export default function Browse() {
    const [draft, setDraft] = useState(DEFAULT_FILTERS);
    const [applied, setApplied] = useState(DEFAULT_FILTERS);

    const results = useMemo(() => applyFilters(PARTS, applied), [applied]);

    const update = (patch) => setDraft((d) => ({ ...d, ...patch }));
    const submit = (e) => {
        e.preventDefault();
        setApplied(draft);
    };
    const clearAll = () => {
        setDraft(EMPTY_FILTERS);
        setApplied(EMPTY_FILTERS);
    };
    const removeChip = (patch) => {
        const next = { ...applied, ...patch };
        setDraft(next);
        setApplied(next);
    };

    const chips = [
        ...applied.categories.map((c) => ({ label: c, patch: { categories: applied.categories.filter((v) => v !== c) } })),
        ...(applied.make ? [{ label: applied.make, patch: { make: '' } }] : []),
        ...(applied.year ? [{ label: `Year ${applied.year}`, patch: { year: '' } }] : []),
        ...applied.conditions.map((c) => ({ label: c, patch: { conditions: applied.conditions.filter((v) => v !== c) } })),
        ...(applied.inStock ? [{ label: 'In stock only', patch: { inStock: false } }] : []),
        ...(applied.min !== '' ? [{ label: `Min BHD ${applied.min}`, patch: { min: '' } }] : []),
        ...(applied.max !== '' ? [{ label: `Max BHD ${applied.max}`, patch: { max: '' } }] : []),
    ];

    return (
        <div className="browse-layout">
            <form className="filters-panel" aria-label="Filters" onSubmit={submit}>
                <h2 className="sidebar-title">Filters</h2>

                <fieldset className="filter-fieldset">
                    <legend>Category</legend>
                    {CATEGORIES.map((c) => (
                        <label key={c} className="check-row">
                            <input
                                type="checkbox"
                                checked={draft.categories.includes(c)}
                                onChange={() => update({ categories: toggle(draft.categories, c) })}
                            />
                            {c}
                        </label>
                    ))}
                </fieldset>

                <div className="form-group">
                    <label htmlFor="filter-make">Make</label>
                    <select id="filter-make" className="form-input" value={draft.make} onChange={(e) => update({ make: e.target.value })}>
                        <option value="">All makes</option>
                        {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="filter-year">Model year</label>
                    <select id="filter-year" className="form-input" value={draft.year} onChange={(e) => update({ year: e.target.value })}>
                        <option value="">Any year</option>
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <fieldset className="filter-fieldset">
                    <legend>Condition</legend>
                    {['Used', 'Refurbished'].map((c) => (
                        <label key={c} className="check-row">
                            <input
                                type="checkbox"
                                checked={draft.conditions.includes(c)}
                                onChange={() => update({ conditions: toggle(draft.conditions, c) })}
                            />
                            {c}
                        </label>
                    ))}
                </fieldset>

                <fieldset className="filter-fieldset">
                    <legend>Availability</legend>
                    <label className="check-row">
                        <input type="checkbox" checked={draft.inStock} onChange={(e) => update({ inStock: e.target.checked })} />
                        In stock only
                    </label>
                </fieldset>

                <fieldset className="filter-fieldset">
                    <legend>Price (BHD)</legend>
                    <div className="price-inputs">
                        <div>
                            <label htmlFor="price-min" className="sr-only">Minimum price in BHD</label>
                            <input id="price-min" type="number" min="0" className="form-input" placeholder="Min 0" value={draft.min} onChange={(e) => update({ min: e.target.value })} />
                        </div>
                        <div>
                            <label htmlFor="price-max" className="sr-only">Maximum price in BHD</label>
                            <input id="price-max" type="number" min="0" className="form-input" placeholder="Max 40" value={draft.max} onChange={(e) => update({ max: e.target.value })} />
                        </div>
                    </div>
                </fieldset>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Apply filters</button>
                <p style={{ marginTop: '0.75rem' }}>
                    <button type="button" className="text-button" onClick={clearAll}>Clear all filters</button>
                </p>
            </form>

            <section className="browse-results" aria-labelledby="browse-title">
                <h2 id="browse-title">Browse parts</h2>
                <p className="page-heading">
                    Search secondhand car parts listed by sellers. Filter by category, vehicle, condition and price.
                </p>

                <form className="filter-toolbar" role="search" aria-label="Search parts" onSubmit={submit}>
                    <div className="filter-search">
                        <label htmlFor="part-search">Search parts</label>
                        <input
                            id="part-search"
                            type="search"
                            className="form-input"
                            placeholder="Part name, make, model or listing ID"
                            value={draft.query}
                            onChange={(e) => update({ query: e.target.value })}
                        />
                    </div>
                    <div className="filter-status">
                        <label htmlFor="part-sort">Sort by</label>
                        <select id="part-sort" className="form-input" value={draft.sort} onChange={(e) => update({ sort: e.target.value })}>
                            <option value="newest">Newest first</option>
                            <option value="price-asc">Price: low to high</option>
                            <option value="price-desc">Price: high to low</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary">Search</button>
                </form>

                {chips.length > 0 && (
                    <div className="chip-row">
                        <span className="listing-meta">Active filters:</span>
                        <ul className="chip-list">
                            {chips.map((chip) => (
                                <li key={chip.label}>
                                    <button type="button" className="chip" onClick={() => removeChip(chip.patch)}>
                                        {chip.label} <span aria-hidden="true">×</span>
                                        <span className="sr-only"> (remove filter)</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button type="button" className="text-button" onClick={clearAll}>Clear all</button>
                    </div>
                )}

                <h3 className="results-count" role="status" aria-live="polite">
                    {results.length} {results.length === 1 ? 'part' : 'parts'} found
                </h3>

                {results.length === 0 ? (
                    <div className="card empty-state">
                        <h4 className="delete-title">No parts match your search</h4>
                        <p className="delete-description">Try fewer filters, a different part name or a wider price range.</p>
                        <button type="button" className="btn-secondary" onClick={clearAll}>Clear all filters</button>
                    </div>
                ) : (
                    <ul className="part-grid">
                        {results.map((p) => (
                            <li key={p.id} className="part-card">
                                <div className="photo-placeholder" aria-hidden="true">Part photo</div>
                                <div className="part-card-body">
                                    <h4 className="part-card-title">{p.name}</h4>
                                    <p className="listing-meta">{yearRange(p)} · {p.make} {p.model} · {p.id}</p>
                                    <p className="listing-meta">
                                        <span className="tag">{p.condition}</span> {p.stock > 0 ? 'In stock' : 'Out of stock'}
                                    </p>
                                    <p className="price-card">{formatBHD(p.price)}</p>
                                    <p className="listing-meta">Seller: {p.seller}</p>
                                    <Link to={`/parts/${p.id}`} className="btn-secondary btn-link btn-block" aria-label={`View details for ${p.name}`}>
                                        View details
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <p className="listing-meta" style={{ marginTop: '1rem' }}>
                    Showing {results.length === 0 ? '0' : `1–${results.length}`} of {results.length} · Page 1 of 1
                </p>
            </section>
        </div>
    );
}

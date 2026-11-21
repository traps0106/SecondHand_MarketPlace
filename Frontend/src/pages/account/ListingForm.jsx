import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createListing, getMyListing, updateListing } from '../../api/seller';
import useMeta from '../../hooks/useMeta';
import { formatAmount } from '../../utils/format';

const EMPTY = {
    name: '', category: '', make: '', model: '', year: '',
    condition: '', price: '', quantity: '1', partNumber: '', description: '',
};

const PRICE_PATTERN = /^\d+(\.\d{1,3})?$/;

// Mirrors the server rules for instant feedback. The server stays the
// authority: its field errors are shown the same way.
function validate(v, limits) {
    const e = {};
    if (!v.name.trim()) e.name = 'Part name is required';
    if (!v.category) e.category = 'Select a category';
    if (!v.make.trim()) e.make = 'Vehicle make is required';
    if (!v.model.trim()) e.model = 'Vehicle model is required';
    const year = Number(v.year);
    if (!Number.isInteger(year) || year < limits.minYear || year > limits.maxYear) {
        e.year = `Enter a year between ${limits.minYear} and ${limits.maxYear}`;
    }
    if (!v.condition) e.condition = 'Select a condition';
    if (!PRICE_PATTERN.test(v.price) || Number(v.price) <= 0) e.price = 'Enter a price with up to 3 decimal places';
    if (!/^\d+$/.test(v.quantity)) e.quantity = 'Enter a whole number of 0 or more';
    return e;
}

const toFormValues = (listing) => ({
    name: listing.name,
    category: listing.category,
    make: listing.make,
    model: listing.model,
    year: String(listing.year),
    condition: listing.condition,
    price: formatAmount(listing.price),
    quantity: String(listing.quantity),
    partNumber: listing.partNumber,
    description: listing.description,
});

// Form values -> API payload (numbers where the API expects them).
const toPayload = (v) => ({
    ...v,
    year: Number(v.year),
    quantity: Number(v.quantity),
});

// Shared by "Create listing" and "Edit listing" (mode="edit" loads :id).
export default function ListingForm({ mode = 'create' }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = mode === 'edit';
    const { meta, error: metaError } = useMeta();

    const [values, setValues] = useState(EMPTY);
    const [original, setOriginal] = useState(null);
    const [loadState, setLoadState] = useState(isEdit ? 'loading' : 'ready'); // loading | ready | missing | error
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isEdit) return undefined;
        let cancelled = false;
        getMyListing(id)
            .then((listing) => {
                if (cancelled) return;
                const formValues = toFormValues(listing);
                setValues(formValues);
                setOriginal(formValues);
                setLoadState('ready');
            })
            .catch((e) => {
                if (cancelled) return;
                setLoadState(e.status === 404 || e.status === 400 ? 'missing' : 'error');
                setFormError(e.message);
            });
        return () => { cancelled = true; };
    }, [id, isEdit]);

    const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
    const errorCount = Object.keys(errors).length;

    const focusSummary = () => requestAnimationFrame(() => document.getElementById('form-error-summary')?.focus());

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        const found = validate(values, meta.limits);
        setErrors(found);
        if (Object.keys(found).length) return focusSummary();

        const payload = toPayload(values);
        setSubmitting(true);
        try {
            if (isEdit) {
                // PATCH only what changed, so a stock-only edit stays live.
                const changes = Object.fromEntries(
                    Object.entries(payload).filter(([field]) => values[field] !== original[field]),
                );
                if (Object.keys(changes).length) await updateListing(id, changes);
                navigate('/account/listings', { state: { result: 'updated' } });
            } else {
                await createListing(payload);
                navigate('/account/listings', { state: { result: 'created' } });
            }
        } catch (err) {
            setErrors(err.details ?? {});
            setFormError(err.message);
            focusSummary();
        } finally {
            setSubmitting(false);
        }
    };

    if (metaError) return <div className="banner banner-error" role="alert">⚠ {metaError}. Make sure the backend is running.</div>;
    if (loadState === 'missing') {
        return (
            <div className="card">
                <h2 className="card-title">Listing not found</h2>
                <p>This listing does not exist or belongs to another seller.</p>
                <Link to="/account/listings" className="text-link">Back to my listings</Link>
            </div>
        );
    }
    if (loadState === 'error') return <div className="banner banner-error" role="alert">⚠ {formError}</div>;
    if (!meta || loadState === 'loading') return <p>Loading…</p>;

    const { limits } = meta;

    // Renders a labelled field with hint + error wiring.
    const field = (name, label, input, { hint, required = true } = {}) => (
        <div className="form-group">
            <label htmlFor={`f-${name}`}>
                {label} {required && <span className="required-mark" aria-hidden="true">*</span>}
            </label>
            {input}
            {hint && <p className="listing-meta" id={`f-${name}-hint`}>{hint}</p>}
            {errors[name] && <p className="field-error" id={`f-${name}-error`}>⚠ {errors[name]}</p>}
        </div>
    );

    const props = (name, { hint = false, required = true } = {}) => ({
        id: `f-${name}`,
        className: 'form-input',
        value: values[name],
        onChange: set(name),
        required,
        'aria-invalid': errors[name] ? 'true' : undefined,
        'aria-describedby': [hint ? `f-${name}-hint` : null, errors[name] ? `f-${name}-error` : null].filter(Boolean).join(' ') || undefined,
    });

    return (
        <div>
            <div className="page-heading">
                <h2>{isEdit ? `Edit listing · ${original?.name}` : 'Create listing'}</h2>
                <p>
                    {isEdit
                        ? 'Update details, price or stock for your own listing. Changes other than stock are re-reviewed by an administrator.'
                        : 'Add a secondhand car part. It is submitted for moderation before it appears in Browse.'}
                </p>
            </div>

            {(errorCount > 0 || formError) && (
                <div id="form-error-summary" className="banner banner-error" role="alert" tabIndex={-1}>
                    ⚠ {errorCount > 0
                        ? `Please fix the ${errorCount} ${errorCount === 1 ? 'field' : 'fields'} below before continuing.`
                        : formError}
                </div>
            )}

            <form className="card" onSubmit={handleSubmit} noValidate>
                <h3 className="card-title">Listing details</h3>
                <p className="card-subtitle">
                    Fields marked * are required. Your listing is reviewed by an administrator before it appears in Browse.
                </p>

                <div className="form-grid">
                    {field('name', 'Part name',
                        <input type="text" placeholder="e.g. Toyota Corolla alternator" maxLength={limits.nameMaxLength} {...props('name')} />)}
                    {field('category', 'Category',
                        <select {...props('category')}>
                            <option value="">Select a category</option>
                            {meta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>)}
                    {field('make', 'Vehicle make',
                        <input type="text" placeholder="e.g. Toyota" maxLength={limits.vehicleFieldMaxLength} {...props('make')} />)}
                    {field('model', 'Vehicle model',
                        <input type="text" placeholder="e.g. Corolla" maxLength={limits.vehicleFieldMaxLength} {...props('model')} />)}
                    {field('year', 'Vehicle year',
                        <input type="text" inputMode="numeric" placeholder="e.g. 2016" {...props('year', { hint: true })} />,
                        { hint: `${limits.minYear}–${limits.maxYear}` })}
                    {field('condition', 'Condition',
                        <select {...props('condition')}>
                            <option value="">Select a condition</option>
                            {meta.conditions.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>)}
                    {field('price', `Price (${meta.currency.code})`,
                        <input type="text" inputMode="decimal" placeholder="0.000" {...props('price', { hint: true })} />,
                        { hint: `Up to ${meta.currency.decimals} decimal places` })}
                    {field('quantity', 'Stock quantity',
                        <input type="text" inputMode="numeric" placeholder="1" {...props('quantity', { hint: true })} />,
                        { hint: 'Whole number, 0 or more' })}
                    {field('partNumber', 'Part number',
                        <input type="text" placeholder="e.g. 27060-0T020" maxLength={limits.partNumberMaxLength} {...props('partNumber', { required: false })} />,
                        { required: false })}
                </div>

                {field('description', 'Description',
                    <textarea rows={4} placeholder="Describe the part, its condition and any wear." maxLength={limits.descriptionMaxLength} {...props('description', { required: false })} />,
                    { required: false })}

                <div className="delete-actions">
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Submit for review'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => navigate('/account/listings')} disabled={submitting}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

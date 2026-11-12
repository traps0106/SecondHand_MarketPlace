import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CATEGORIES, PARTS, yearRange } from '../../data/parts';

const EMPTY = {
    name: '', category: '', make: '', model: '', years: '',
    condition: 'Used', price: '', stock: '1', description: '',
};

function validate(v) {
    const e = {};
    if (!v.name.trim()) e.name = 'Part name is required';
    if (!v.category) e.category = 'Select a category';
    if (!v.make.trim()) e.make = 'Vehicle make is required';
    if (!v.model.trim()) e.model = 'Vehicle model is required';
    if (!v.years.trim()) e.years = 'Model years are required';
    if (!v.condition) e.condition = 'Select a condition';
    if (v.price === '' || !/^\d+(\.\d{1,3})?$/.test(v.price) || Number(v.price) <= 0) {
        e.price = 'Enter a price with up to 3 decimal places';
    }
    if (!/^\d+$/.test(v.stock)) e.stock = 'Enter a whole number of 0 or more';
    return e;
}

// Shared by "Create listing" and "Edit listing" (pass mode="edit" to prefill from :id).
export default function ListingForm({ mode = 'create' }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = mode === 'edit';

    const existing = isEdit ? PARTS.find((p) => p.id === id) ?? PARTS[0] : null;
    const [values, setValues] = useState(
        existing
            ? {
                name: existing.name, category: existing.category, make: existing.make, model: existing.model,
                years: yearRange(existing), condition: existing.condition, price: existing.price.toFixed(3),
                stock: String(existing.stock), description: existing.description,
            }
            : EMPTY,
    );
    const [errors, setErrors] = useState({});
    const [photoNote, setPhotoNote] = useState('');

    const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
    const errorCount = Object.keys(errors).length;

    const handleSubmit = (e) => {
        e.preventDefault();
        const found = validate(values);
        setErrors(found);
        if (Object.keys(found).length === 0) {
            navigate('/account/listings', { state: { submitted: true } });
        } else {
            requestAnimationFrame(() => document.getElementById('form-error-summary')?.focus());
        }
    };

    const handlePhotos = (e) => {
        const count = e.target.files.length;
        if (count > 5) {
            e.target.value = '';
            setPhotoNote('You can add up to 5 photos. Please choose again.');
        } else {
            setPhotoNote(count ? `${count} photo${count > 1 ? 's' : ''} selected.` : '');
        }
    };

    // Helper to render a labelled field with hint + error wiring.
    const field = (name, label, input, hint) => (
        <div className="form-group">
            <label htmlFor={`f-${name}`}>
                {label} <span className="required-mark" aria-hidden="true">*</span>
            </label>
            {input}
            {hint && <p className="listing-meta" id={`f-${name}-hint`}>{hint}</p>}
            {errors[name] && <p className="field-error" id={`f-${name}-error`}>⚠ {errors[name]}</p>}
        </div>
    );

    const props = (name, hint) => ({
        id: `f-${name}`,
        className: 'form-input',
        value: values[name],
        onChange: set(name),
        required: true,
        'aria-invalid': errors[name] ? 'true' : undefined,
        'aria-describedby': [hint ? `f-${name}-hint` : null, errors[name] ? `f-${name}-error` : null].filter(Boolean).join(' ') || undefined,
    });

    return (
        <div>
            <div className="page-heading">
                <h2>{isEdit ? `Edit listing ${existing.id}` : 'Create listing'}</h2>
                <p>
                    {isEdit
                        ? 'Update details, price or stock for your own listing. Changes are re-reviewed by an administrator.'
                        : 'Add a secondhand car part. It is submitted for moderation before it appears in Browse.'}
                </p>
            </div>

            {errorCount > 0 && (
                <div id="form-error-summary" className="banner banner-error" role="alert" tabIndex={-1}>
                    ⚠ Please fix the {errorCount} {errorCount === 1 ? 'field' : 'fields'} below before continuing.
                </div>
            )}

            <form className="card" onSubmit={handleSubmit} noValidate>
                <h3 className="card-title">Listing details</h3>
                <p className="card-subtitle">
                    Fields marked * are required. Your listing is reviewed by an administrator before it appears in Browse.
                </p>

                <div className="form-grid">
                    {field('name', 'Part name', <input type="text" placeholder="e.g. Toyota Corolla alternator" {...props('name')} />)}
                    {field('category', 'Category',
                        <select {...props('category')}>
                            <option value="">Select a category</option>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>)}
                    {field('make', 'Vehicle make', <input type="text" placeholder="e.g. Toyota" {...props('make')} />)}
                    {field('model', 'Vehicle model', <input type="text" placeholder="e.g. Corolla" {...props('model')} />)}
                    {field('years', 'Model years', <input type="text" placeholder="e.g. 2014–2018" {...props('years')} />)}
                    {field('condition', 'Condition',
                        <select {...props('condition')}>
                            <option value="Used">Used</option>
                            <option value="Refurbished">Refurbished</option>
                        </select>)}
                    {field('price', 'Price (BHD)',
                        <input type="text" inputMode="decimal" placeholder="0.000" {...props('price', true)} />,
                        'Up to 3 decimal places')}
                    {field('stock', 'Stock quantity',
                        <input type="text" inputMode="numeric" placeholder="1" {...props('stock', true)} />,
                        'Whole number, 0 or more')}
                </div>

                <div className="form-group">
                    <label htmlFor="f-description">Description</label>
                    <textarea
                        id="f-description"
                        className="form-input"
                        rows={4}
                        placeholder="Describe the part, its condition and any wear."
                        value={values.description}
                        onChange={set('description')}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="f-photos">Photos (up to 5)</label>
                    <input id="f-photos" type="file" accept="image/*" multiple className="form-input" onChange={handlePhotos} aria-describedby="f-photos-note" />
                    <p className="listing-meta" id="f-photos-note" role="status">{photoNote}</p>
                </div>

                <div className="delete-actions">
                    <button type="submit" className="btn-primary">{isEdit ? 'Save changes' : 'Submit for review'}</button>
                    <button type="button" className="btn-secondary" onClick={() => navigate('/account/listings')}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function validate(v) {
    const e = {};
    if (!v.fullName.trim()) e.fullName = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter a valid email address';
    if (v.password.length < 8) e.password = 'Use at least 8 characters';
    if (v.confirm !== v.password || !v.confirm) e.confirm = 'Passwords do not match';
    if (!v.terms) e.terms = 'You must agree to the Terms of use and Privacy policy';
    return e;
}

export default function Register() {
    const navigate = useNavigate();
    const [values, setValues] = useState({
        fullName: '', email: '', password: '', confirm: '', sellerName: '', contact: '', terms: false,
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const set = (field) => (e) =>
        setValues((v) => ({ ...v, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    const errorCount = Object.keys(errors).length;

    const handleSubmit = (e) => {
        e.preventDefault();
        const found = validate(values);
        setErrors(found);
        if (Object.keys(found).length === 0) {
            navigate('/login', { state: { registered: true } });
        } else {
            requestAnimationFrame(() => document.getElementById('register-error-summary')?.focus());
        }
    };

    const describe = (name) => (errors[name] ? { 'aria-invalid': 'true', 'aria-describedby': `${name}-error` } : {});
    const error = (name) => errors[name] && <p className="field-error" id={`${name}-error`}>⚠ {errors[name]}</p>;

    return (
        <div className="auth-container">
            <header className="app-header">
                <h1>Parts Market</h1>
            </header>
            <main className="auth-box">
                {errorCount > 0 && (
                    <div id="register-error-summary" className="banner banner-error" role="alert" tabIndex={-1}>
                        ⚠ Please fix the {errorCount} {errorCount === 1 ? 'field' : 'fields'} below before continuing.
                    </div>
                )}
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create account</h2>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="fullName">Full name *</label>
                        <input id="fullName" type="text" autoComplete="name" className="form-input" required
                            value={values.fullName} onChange={set('fullName')} {...describe('fullName')} />
                        {error('fullName')}
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email address *</label>
                        <input id="email" type="email" autoComplete="email" className="form-input" required
                            value={values.email} onChange={set('email')} {...describe('email')} />
                        {error('email')}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <div className="input-with-toggle">
                            <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                                className="form-input" required value={values.password} onChange={set('password')} {...describe('password')} />
                            <button type="button" className="text-button" aria-label={`${showPassword ? 'Hide' : 'Show'} password`} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        {error('password')}
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm">Confirm password *</label>
                        <div className="input-with-toggle">
                            <input id="confirm" type={showConfirm ? 'text' : 'password'} autoComplete="new-password"
                                className="form-input" required value={values.confirm} onChange={set('confirm')} {...describe('confirm')} />
                            <button type="button" className="text-button" aria-label={`${showConfirm ? 'Hide' : 'Show'} confirm password`} onClick={() => setShowConfirm(!showConfirm)}>
                                {showConfirm ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        {error('confirm')}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="sellerName">Seller display name</label>
                            <input id="sellerName" type="text" className="form-input" placeholder="Hassan Auto Spares"
                                value={values.sellerName} onChange={set('sellerName')} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="contact">Contact no.</label>
                            <input id="contact" type="tel" autoComplete="tel" className="form-input" placeholder="+973 3600 1200"
                                value={values.contact} onChange={set('contact')} />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="check-row">
                            <input type="checkbox" id="terms" checked={values.terms} onChange={set('terms')} required {...describe('terms')} />
                            <label htmlFor="terms" style={{ margin: 0 }}>I agree to the Terms of use and Privacy policy. *</label>
                        </div>
                        {error('terms')}
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>Let's Role!</button>
                </form>
                <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                    <Link to="/login" className="text-link">Already registered? Log in</Link>
                </p>
            </main>
        </div>
    );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email.trim() || !password) {
            setErrorMessage('Please fill in all mandatory fields.');
            return;
        }

        // Navigate to account portal on successful sign in
        navigate('/account/overview');
    };

    return (
        <div className="auth-container">
            <header className="app-header">
                <h1>Parts Market</h1>
            </header>

            <div className="auth-box">
                <div className="card">
                    <h2 className="card-title">Sign in</h2>
                    <p className="card-subtitle">
                        Log in with the email address linked to your account.
                    </p>

                    {errorMessage && (
                        <div
                            style={{
                                padding: '0.75rem',
                                marginBottom: '1rem',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#991b1b',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                            }}
                        >
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>
                                Email address <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <label style={{ margin: 0 }}>
                                    Password <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#4b5563',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                    }}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '0.5rem' }}>
                            <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: '#4b5563', textDecoration: 'underline' }}>
                                Forgot password?
                            </Link>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <Link to="/register" style={{ fontSize: '0.75rem', color: '#4b5563', textDecoration: 'underline' }}>
                                New to Parts Market? Create an account
                            </Link>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                            Let's Role
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
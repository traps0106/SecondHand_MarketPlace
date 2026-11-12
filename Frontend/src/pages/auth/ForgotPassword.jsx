import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Request, 2: Sent Confirmation, 3: Reset Form
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [cooldown, setCooldown] = useState(60);
    const [isCooldownActive, setIsCooldownActive] = useState(false);

    useEffect(() => {
        let timer;
        if (isCooldownActive && cooldown > 0) {
            timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
        } else if (cooldown === 0) {
            setIsCooldownActive(false);
        }
        return () => clearInterval(timer);
    }, [isCooldownActive, cooldown]);

    const handleSendLink = (e) => {
        e.preventDefault();
        setStep(2);
        setIsCooldownActive(true);
        setCooldown(60);
    };

    const handleResend = () => {
        setCooldown(60);
        setIsCooldownActive(true);
    };

    return (
        <div className="auth-container">
            <header className="app-header">
                <h1>Parts Market</h1>
            </header>

            <div className="auth-box">
                <div className="card">
                    {step === 1 && (
                        <>
                            <h2 className="card-title">Reset your password</h2>
                            <p className="card-subtitle">
                                Enter your account email. If it matches an account, a password reset link will be sent.
                            </p>

                            <form onSubmit={handleSendLink}>
                                <div className="form-group">
                                    <label htmlFor="EmailSol">Email address</label>
                                    <input
                                        id="EmailSol"
                                        type="email"
                                        className="form-input"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                                    Send reset link
                                </button>
                            </form>

                            <div style={{ marginTop: '1rem' }}>
                                <Link to="/login" style={{ fontSize: '0.75rem', color: '#4b5563', textDecoration: 'underline' }}>
                                    ← Back to login
                                </Link>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <div style={{ textAlign: 'center' }}>
                            <h2 className="card-title">Check your inbox</h2>
                            <p className="card-subtitle" style={{ marginBottom: '1.5rem' }}>
                                Didn't receive an email? Check the address or wait before requesting another link.
                            </p>

                            <button
                                onClick={handleResend}
                                disabled={isCooldownActive}
                                className="btn-secondary"
                                style={{
                                    width: '100%',
                                    opacity: isCooldownActive ? 0.5 : 1,
                                    cursor: isCooldownActive ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {isCooldownActive
                                    ? `Resend link in ${cooldown} seconds`
                                    : 'Resend reset link'}
                            </button>

                            <div style={{ marginTop: '1rem' }}>
                                <button
                                    onClick={() => setStep(3)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '0.75rem',
                                        color: '#2563eb',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        display: 'block',
                                        margin: '0 auto 0.75rem auto',
                                    }}
                                >
                                    (Simulate clicking email link to set new password)
                                </button>

                                <Link to="/login" style={{ fontSize: '0.75rem', color: '#4b5563', textDecoration: 'underline' }}>
                                    ← Back to login
                                </Link>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <>
                            <h2 className="card-title">Choose a new password</h2>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    alert('Password reset successfully!');
                                }}
                            >
                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label>New password</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ background: 'none', border: 'none', color: '#4b5563', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem' }}
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Confirm new password</label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                                    Reset password
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
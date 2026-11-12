import React from 'react';
import { useNavigate } from 'react-router-dom';



export default function Register() {
    const navigate = useNavigate();
    const proceed = () => {
        navigate('/account/overview');
    };
    return (
        <div className="auth-container">
            <header className="app-header">
                <h1>Parts Market</h1>
            </header>
            <div className="auth-box">
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create account</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="Fullname">Full name *</label>
                        <input id="Fullname" type="text" className="form-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="Email">Email address *</label>
                        <input id="Email" type="email" className="form-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="Password">Password *</label>
                        <input id="Password" type="password" className="form-input" defaultValue="••••••••••••" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="ConfirmPass">Confirm password *</label>
                        <input id="ConfirmPass" type="password" className="form-input" defaultValue="••••••••••••" />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Seller display name</label>
                            <input type="text" className="form-input" placeholder="Hassan Auto Spares" />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Contact no.</label>
                            <input type="text" className="form-input" placeholder="+973 3600 1200" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', margin: '0.5rem 0 1.5rem 0' }}>
                        <input type="checkbox" id="terms" />
                        <label htmlFor="terms">I agree to the Terms of use and Privacy policy. *</label>
                    </div>
                    <button onClick={proceed} className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>Let's Role!</button>
                </form>
            </div>
        </div>
    );
}
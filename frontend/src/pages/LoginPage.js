import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import authService from '../services/authService.js';
import '../App.css'; 

function LoginPage() {
    // 1. State for form inputs and UI feedback
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. Hooks for context and navigation
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); 
        
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await authService.login({ email, password });            
            login(result.user); 
            navigate('/dashboard'); 

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'An unexpected error occurred during login.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        
        <main className="auth-container">
            <section className="auth-card" aria-label="Login form">
                <div className="auth-title-logo">SecureCloud</div>
                <h2 className="auth-title">Login to Your Account</h2>
                
                {error && (
                    <div role="alert" style={{ color: '#e63946', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@securecloud.com"
                            required
                            aria-required="true"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                            aria-required="true"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="auth-btn primary-auth-btn"
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                    >
                        {isSubmitting ? 'Logging In...' : 'Login'}
                    </button>
                </form>

                <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>

                <div className="secondary-auth-text">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </div>
            </section>
        </main>
    );
}

export default LoginPage;
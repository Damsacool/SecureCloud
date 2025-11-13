import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import authService from '../services/authService.js';
import '../App.css';

function RegistrationPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!fullName || !email || !password || !confirmPassword) {
            setError('All fields are required.');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await authService.register({ fullName, email, password });
            login(result.user); 
            
            // Show verification message prominently
            if (result.message) {
                // Using alert for now - replacement with better UI later
                setTimeout(() => {
                    alert(result.message + '\n\nPlease check your email (including spam folder) for the verification link.');
                }, 300);
            }
            
            navigate('/dashboard'); 

        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'An unexpected error occurred during registration.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="auth-container">
            <section className="auth-card" aria-label="Registration form">
                <div className="auth-title-logo">SecureCloud</div>
                <h2 className="auth-title">Create Your Account</h2>
                
                {error && (
                    <div role="alert" style={{ color: '#e63946', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>
                        {error}
                    </div>
                )}
                
                {isSubmitting && (
                    <div style={{ 
                        background: '#e3f2fd', 
                        border: '1px solid #2196f3', 
                        borderRadius: '8px', 
                        padding: '12px', 
                        marginBottom: '15px', 
                        textAlign: 'center',
                        color: '#1976d2',
                        fontWeight: '500'
                    }}>
                        Creating your account... This may take a few seconds.
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Akande Samad"
                            required
                            aria-required="true"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@email.com"
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
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        style={{ opacity: isSubmitting ? 0.7 : 1 }}
                    >
                        {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>

                <div className="secondary-auth-text">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </section>
        </main>
    );
}

export default RegistrationPage;
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api/auth`
    : 'http://localhost:4000/api/auth';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    // Call backend to verify
    axios
      .get(`${API_URL}/verify-email/${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. Token may be invalid or expired.');
      });
  }, [searchParams, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Email Verification</h2>
        
        {status === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p>Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16, color: '#10b981' }}>✓</div>
            <p style={{ color: '#10b981', fontSize: 18, fontWeight: 600 }}>{message}</p>
            <p style={{ marginTop: 16, color: '#666' }}>Redirecting to login...</p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16, color: '#e63946' }}>✗</div>
            <p style={{ color: '#e63946', fontSize: 16, marginBottom: 24 }}>{message}</p>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;

import React, { useState } from 'react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('If that email is registered, a reset link has been sent. Check your inbox.');
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="form-card">
      <h2>Forgot Password</h2>
      <p>Enter your email and we'll send you a reset link.</p>
      <form onSubmit={submit}>
        <input type="email" placeholder="Your email" required value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
